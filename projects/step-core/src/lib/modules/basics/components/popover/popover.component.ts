import {
  AfterViewInit,
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
} from '@angular/core';
import { Overlay, OverlayRef, ConnectedPosition } from '@angular/cdk/overlay';
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
  readonly mode = input<PopoverMode>(PopoverMode.BOTH);
  readonly toggledEvent = output<boolean>();

  readonly PopoverMode = PopoverMode;

  protected toggled = false;
  private isPopoverFrozen = false;
  private tooltipTimeout?: ReturnType<typeof setTimeout>;
  private isMouseOverPopover = false;
  private isMouseOverTrigger = false;

  private overlayRef?: OverlayRef;

  // backdrop class names
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

    const positionStrategy = this.overlay.position().flexibleConnectedTo(this._el).withPositions([this.mapPosition()]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: true,
      backdropClass: this.passiveBackdropClass,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });

    this.overlayRef.backdropClick().subscribe(() => {
      if (!this.isPopoverFrozen) this.closePopover();
    });
  }

  private mapPosition(): ConnectedPosition {
    const x = this.xPosition();
    const y = this.yPosition();
    return {
      originX: (x === 'after' ? 'start' : 'end') as 'start' | 'end',
      originY: (y === 'above' ? 'top' : 'bottom') as 'top' | 'bottom',
      overlayX: (x === 'after' ? 'start' : 'end') as 'start' | 'end',
      overlayY: (y === 'above' ? 'bottom' : 'top') as 'bottom' | 'top',
    };
  }

  private openPopover(): void {
    this.createOverlay();
    if (this.overlayRef && !this.overlayRef.hasAttached()) {
      const portal = new TemplatePortal(this.popoverTemplate, this.vcr);
      this.overlayRef.attach(portal);
    }
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
    if (active) {
      backdrop.classList.add(this.activeBackdropClass);
    } else {
      backdrop.classList.remove(this.activeBackdropClass);
    }
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
      .subscribe(() => {
        this.closePopover();
      });
  }
}
