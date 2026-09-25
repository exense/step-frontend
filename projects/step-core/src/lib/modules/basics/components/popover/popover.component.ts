import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  TemplateRef,
  ViewEncapsulation,
  ViewContainerRef,
  forwardRef,
  inject,
  input,
  output,
  computed,
  viewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { Overlay, OverlayRef, FlexibleConnectedPositionStrategy, ConnectedPosition } from '@angular/cdk/overlay';
import { ESCAPE, hasModifierKey } from '@angular/cdk/keycodes';
import { TemplatePortal } from '@angular/cdk/portal';
import { ScrollDispatcher } from '@angular/cdk/overlay';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, filter, Subject, takeUntil } from 'rxjs';

export enum PopoverMode {
  BOTH,
  HOVER,
  CLICK,
}

export abstract class PopoverService {
  abstract freezePopover(): void;
  abstract unfreezePopover(): void;
}

@Component({
  selector: 'step-popover',
  standalone: false,
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: PopoverService,
      useExisting: forwardRef(() => PopoverComponent),
    },
  ],
})
export class PopoverComponent implements PopoverService, AfterViewInit, OnDestroy {
  private readonly _el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _scrollDispatcher = inject(ScrollDispatcher);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _overlay = inject(Overlay);
  private readonly _vcr = inject(ViewContainerRef);

  private readonly popoverTemplate = viewChild.required<TemplateRef<unknown>>('popoverTemplate');

  readonly xPosition = input<'before' | 'after'>('after');
  readonly yPosition = input<'above' | 'below'>('below');
  readonly noPadding = input(false);
  readonly withBorder = input(false);
  readonly whiteBackground = input(false);
  readonly smallFont = input(true);
  readonly mode = input<PopoverMode>(PopoverMode.BOTH);
  readonly toggledEvent = output<boolean>();
  protected readonly PopoverMode = PopoverMode;

  private toggled = false;
  private isPopoverFrozen = false;
  private tooltipTimeout?: ReturnType<typeof setTimeout>;
  private isMouseOverPopover = false;
  private isMouseOverTrigger = false;

  private overlayRef?: OverlayRef;
  private positionStrategy?: FlexibleConnectedPositionStrategy;
  private terminator$?: Subject<void>;

  private readonly passiveBackdropClass = 'step-popover-backdrop--passive';
  private readonly activeBackdropClass = 'step-popover-backdrop--active';

  protected readonly popoverClass = computed(() => {
    const base = 'step-popover-menu';
    return this.withBorder() ? `${base} with-border` : base;
  });

  ngAfterViewInit(): void {
    this.setupClosePopoverOnScroll();
  }

  ngOnDestroy(): void {
    // Clear timeout to prevent overlay creation, if it was scheduled
    clearTimeout(this.tooltipTimeout);
    this.terminate();
    this.overlayRef?.dispose();
  }

  // eslint-disable-next-line step-lint/component-public-fields -- Imperative API used by popover consumers.
  openPopover(): void {
    this.createOverlay();
    if (this.overlayRef && !this.overlayRef.hasAttached()) {
      this.setupOverlaySubscriptions();
      this.overlayRef.attach(new TemplatePortal(this.popoverTemplate(), this._vcr));
    }
    this.overlayRef?.updatePosition();

    this.setBackdropActive(this.toggled);
    this.toggledEvent.emit(this.toggled);
  }

  // eslint-disable-next-line step-lint/component-public-fields -- Imperative API used by popover consumers.
  closePopover(): void {
    if (this.overlayRef?.hasAttached?.()) {
      this.setBackdropActive(false);
      this.overlayRef.detach();
    }
    this.terminate();
    this.toggled = false;
    this.toggledEvent.emit(false);
  }

  private createOverlay(): void {
    if (this.overlayRef) return;

    const positions = this.buildPositions();

    this.positionStrategy = this._overlay
      .position()
      .flexibleConnectedTo(this._el)
      .withPositions(positions)
      .withViewportMargin(8)
      .withPush(false);

    this.positionStrategy.positionChanges.subscribe(({ connectionPair }) => {
      requestAnimationFrame(() => this.applyStyleFromRenderedPosition(connectionPair));
    });

    this.overlayRef = this._overlay.create({
      positionStrategy: this.positionStrategy,
      panelClass: ['step-popover-pane'],
      hasBackdrop: true,
      backdropClass: this.passiveBackdropClass,
      scrollStrategy: this._overlay.scrollStrategies.reposition(),
    });

    this.positionStrategy.positionChanges.subscribe(({ connectionPair }) => {
      this.setBackdropActive(this.toggled);
    });
  }

  private setupOverlaySubscriptions(): void {
    if (!this.overlayRef) return;

    this.terminate();
    this.terminator$ = new Subject<void>();

    this.overlayRef
      .backdropClick()
      .pipe(takeUntil(this.terminator$))
      .subscribe(() => {
        if (!this.isPopoverFrozen) this.closePopover();
      });

    this.overlayRef
      .keydownEvents()
      .pipe(
        filter((event) => event.keyCode === ESCAPE && !hasModifierKey(event)),
        takeUntil(this.terminator$),
      )
      .subscribe((event) => {
        if (!this.toggled || this.isPopoverFrozen) return;
        event.preventDefault();
        this.closePopover();
      });
  }

  private terminate(): void {
    this.terminator$?.next();
    this.terminator$?.complete();
    this.terminator$ = undefined;
  }

  private buildPositions(): ConnectedPosition[] {
    const isBelow = this.yPosition() === 'below';
    const preferLeft = this.xPosition() === 'before';

    const buildPosition = (
      originY: 'top' | 'bottom',
      overlayY: 'top' | 'bottom',
      overlayX: 'start' | 'end',
    ): ConnectedPosition => ({
      originX: 'center',
      originY,
      overlayX,
      overlayY,
    });

    const primary = buildPosition(isBelow ? 'bottom' : 'top', isBelow ? 'top' : 'bottom', preferLeft ? 'end' : 'start');

    const secondary = buildPosition(
      isBelow ? 'bottom' : 'top',
      isBelow ? 'top' : 'bottom',
      preferLeft ? 'start' : 'end',
    );

    const fallbackPrimary = buildPosition(
      isBelow ? 'top' : 'bottom',
      isBelow ? 'bottom' : 'top',
      preferLeft ? 'end' : 'start',
    );

    const fallbackSecondary = buildPosition(
      isBelow ? 'top' : 'bottom',
      isBelow ? 'bottom' : 'top',
      preferLeft ? 'start' : 'end',
    );

    return [primary, secondary, fallbackPrimary, fallbackSecondary];
  }

  private setBackdropActive(active: boolean): void {
    const backdrop = this.overlayRef?.backdropElement;
    if (!backdrop) return;
    backdrop.classList.toggle(this.activeBackdropClass, !!active);
  }

  protected handleClick(event: MouseEvent): void {
    if (this.mode() === PopoverMode.HOVER) return;
    event.preventDefault();
    event.stopImmediatePropagation();

    this.toggled = !this.toggled;
    this.setBackdropActive(this.toggled);

    if (this.toggled && !this.overlayRef?.hasAttached()) {
      this.openPopover();
    }
  }

  protected handleTriggerMouseEnter(): void {
    if (this.mode() === PopoverMode.CLICK || this.toggled) return;
    this.isMouseOverTrigger = true;
    this.tooltipTimeout = setTimeout(() => this.openPopover(), 300);
  }

  protected handleTriggerMouseLeave(): void {
    if (this.mode() === PopoverMode.CLICK) return;
    this.isMouseOverTrigger = false;
    clearTimeout(this.tooltipTimeout);
    this.scheduleCloseIfNotHovered();
  }

  protected handlePopoverMouseEnter(): void {
    if (this.mode() === PopoverMode.CLICK) return;
    this.isMouseOverPopover = true;
  }

  protected handlePopoverMouseLeave(): void {
    if (this.mode() === PopoverMode.CLICK) return;
    this.isMouseOverPopover = false;
    this.scheduleCloseIfNotHovered();
  }

  private scheduleCloseIfNotHovered(): void {
    setTimeout(() => {
      if (!this.isMouseOverPopover && !this.isMouseOverTrigger && !this.isPopoverFrozen && !this.toggled) {
        this.closePopover();
      }
    }, 400);
  }

  private applyStyleFromRenderedPosition(pair: ConnectedPosition): void {
    if (!this.overlayRef?.hasAttached()) return;

    const originRect = this._el.nativeElement.getBoundingClientRect();
    const overlayRect = this.overlayRef.overlayElement.getBoundingClientRect();

    const originCenterX = originRect.left + originRect.width / 2;
    const overlayCenterX = overlayRect.left + overlayRect.width / 2;

    const isBelow = pair.overlayY === 'top' && pair.originY === 'bottom';

    const flowsRight = overlayCenterX >= originCenterX;

    let positionClass: 'right' | 'left' | 'bottom-right' | 'bottom-left';

    if (isBelow) {
      positionClass = flowsRight ? 'right' : 'left';
    } else {
      positionClass = flowsRight ? 'bottom-right' : 'bottom-left';
    }

    const panel = this.overlayRef.overlayElement.querySelector('.step-popover') as HTMLElement | null;
    if (panel) {
      panel.classList.remove('right', 'left', 'bottom-right', 'bottom-left');
      panel.classList.add(positionClass);
    }
  }

  // eslint-disable-next-line step-lint/component-public-fields -- PopoverService contract.
  freezePopover(): void {
    this.isPopoverFrozen = true;
  }

  // eslint-disable-next-line step-lint/component-public-fields -- PopoverService contract.
  unfreezePopover(): void {
    this.isPopoverFrozen = false;
  }

  private setupClosePopoverOnScroll(): void {
    this._scrollDispatcher
      .ancestorScrolled(this._el)
      .pipe(debounceTime(300), takeUntilDestroyed(this._destroyRef))
      .subscribe(() => this.closePopover());
  }
}
