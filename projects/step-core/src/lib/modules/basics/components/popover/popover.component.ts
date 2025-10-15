import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
  ViewContainerRef,
  forwardRef,
  inject,
  input,
  output,
  computed,
  AfterViewInit,
} from '@angular/core';
import { Overlay, OverlayRef, FlexibleConnectedPositionStrategy, ConnectedPosition } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { ScrollDispatcher } from '@angular/cdk/overlay';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';

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
  host: {
    '(document:click)': 'handleDocumentClick()',
  },
  providers: [
    {
      provide: PopoverService,
      useExisting: forwardRef(() => PopoverComponent),
    },
  ],
})
export class PopoverComponent implements PopoverService, AfterViewInit {
  private readonly _el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _scrollDispatcher = inject(ScrollDispatcher);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);

  @ViewChild('popoverTemplate', { static: true }) popoverTemplate!: TemplateRef<unknown>;

  readonly xPosition = input<'before' | 'after'>('after');
  readonly yPosition = input<'above' | 'below'>('above');
  readonly noPadding = input(false);
  readonly withBorder = input(false);
  readonly whiteBackground = input(false);
  readonly smallFont = input(true);
  readonly mode = input<PopoverMode>(PopoverMode.BOTH);
  readonly toggledEvent = output<boolean>();
  readonly PopoverMode = PopoverMode;

  protected toggled = false;
  private isPopoverFrozen = false;
  private tooltipTimeout?: ReturnType<typeof setTimeout>;
  private isMouseOverPopover = false;
  private isMouseOverTrigger = false;

  private overlayRef?: OverlayRef;
  private positionStrategy?: FlexibleConnectedPositionStrategy;

  private readonly passiveBackdropClass = 'step-popover-backdrop--passive';
  private readonly activeBackdropClass = 'step-popover-backdrop--active';

  protected readonly popoverClass = computed(() => {
    const base = 'step-popover-menu';
    return this.withBorder() ? `${base} with-border` : base;
  });

  ngAfterViewInit(): void {
    this.setupClosePopoverOnScroll();
  }

  private createOverlay(): void {
    if (this.overlayRef) return;

    this.positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this._el)
      .withPositions([
        {
          originX: 'center',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
        },
        {
          originX: 'center',
          originY: 'bottom',
          overlayX: 'end',
          overlayY: 'top',
        },
        {
          originX: 'center',
          originY: 'top',
          overlayX: 'end',
          overlayY: 'bottom',
        },
        {
          originX: 'center',
          originY: 'top',
          overlayX: 'end',
          overlayY: 'bottom',
        },
      ])
      .withViewportMargin(8)
      .withPush(false);

    this.positionStrategy.positionChanges.subscribe(({ connectionPair }) => {
      requestAnimationFrame(() => this.applyStyleFromRenderedPosition(connectionPair));
    });

    this.overlayRef = this.overlay.create({
      positionStrategy: this.positionStrategy,
      panelClass: ['step-popover-pane'],
      hasBackdrop: true,
      backdropClass: this.passiveBackdropClass,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });

    this.positionStrategy.positionChanges.subscribe(({ connectionPair }) => {
      this.setBackdropActive(this.toggled);
    });

    this.overlayRef.backdropClick().subscribe(() => {
      if (!this.isPopoverFrozen) this.closePopover();
    });
  }

  private openPopover(): void {
    this.createOverlay();
    if (this.overlayRef && !this.overlayRef.hasAttached()) {
      this.overlayRef.attach(new TemplatePortal(this.popoverTemplate, this.vcr));
    }
    this.overlayRef?.updatePosition();

    this.setBackdropActive(this.toggled);
    this.toggledEvent.emit(true);
  }

  private closePopover(): void {
    if (this.overlayRef?.hasAttached()) {
      this.setBackdropActive(false);
      this.overlayRef.detach();
    }
    this.toggled = false;
    this.toggledEvent.emit(false);
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

  // This is used to close step-popover from inside components by triggering a document click
  protected handleDocumentClick(): void {
    if (this.mode() !== PopoverMode.CLICK || !this.toggled) {
      return;
    }
    this.closePopover();
  }

  protected onTriggerMouseEnter(): void {
    if (this.mode() === PopoverMode.CLICK || this.toggled) return;
    this.isMouseOverTrigger = true;
    this.tooltipTimeout = setTimeout(() => this.openPopover(), 300);
  }

  protected onTriggerMouseLeave(): void {
    if (this.mode() === PopoverMode.CLICK) return;
    this.isMouseOverTrigger = false;
    clearTimeout(this.tooltipTimeout);
    this.scheduleCloseIfNotHovered();
  }

  protected onPopoverMouseEnter(): void {
    if (this.mode() === PopoverMode.CLICK) return;
    this.isMouseOverPopover = true;
  }

  protected onPopoverMouseLeave(): void {
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

  private applyStyleFromRenderedPosition(pair: ConnectedPosition) {
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

  freezePopover(): void {
    this.isPopoverFrozen = true;
  }

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
