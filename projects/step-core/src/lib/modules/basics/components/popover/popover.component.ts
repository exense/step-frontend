import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  forwardRef,
  inject,
  input,
  output,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { TriggerPopoverDirective } from '../../directives/trigger-popover.directive';
import { MatMenu } from '@angular/material/menu';
import { ScrollDispatcher } from '@angular/cdk/overlay';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, map } from 'rxjs';

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
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'StepPopover',
  encapsulation: ViewEncapsulation.None,
  host: {
    '(click)': 'handleClick($event)',
    '(mouseenter)': 'onPopoverMouseEnter()',
    '(mouseleave)': 'onPopoverMouseLeave()',
    '(document:click)': 'handleDocumentClick()',
  },
  providers: [
    {
      provide: PopoverService,
      useExisting: forwardRef(() => PopoverComponent),
    },
  ],
  standalone: false,
})
export class PopoverComponent implements PopoverService, AfterViewInit {
  private _el = inject<ElementRef<HTMLElement>>(ElementRef);
  private _scrollDispatcher = inject(ScrollDispatcher);
  private _destroyRef = inject(DestroyRef);

  readonly xPosition = input<MatMenu['xPosition']>('after');
  readonly yPosition = input<MatMenu['yPosition']>('above');
  readonly noPadding = input(false);
  readonly withBorder = input(false);
  readonly mode = input<PopoverMode>(PopoverMode.BOTH);

  readonly toggledEvent = output<boolean>();

  private triggerPopoverDirective = viewChild(TriggerPopoverDirective);

  private toggled = false;
  private tooltipTimeout?: ReturnType<typeof setTimeout>;

  private isPopoverFrozen = false;

  protected isMouseOverPopover = false;

  protected readonly popoverClass = computed(() => {
    const withBorder = this.withBorder();
    return withBorder ? 'step-popover-menu with-border' : 'step-popover-menu';
  });

  ngAfterViewInit(): void {
    this.setupClosePopoverOnScroll();
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
        if (this.toggled) {
          this.toggled = false;
          this.toggledEvent.emit(false);
        }
        this.closePopover(true);
      });
  }

  private togglePopover(): void {
    if (this.isPopoverFrozen) {
      return;
    }
    this.toggled = !this.toggled;
    this.toggled ? this.triggerPopoverDirective()?.openMenu?.() : this.triggerPopoverDirective()?.closeMenu?.();
    this.toggledEvent.emit(this.toggled);
  }

  protected handleClick($event: MouseEvent): void {
    if (this.mode() === PopoverMode.HOVER) {
      return;
    }
    $event.preventDefault();
    $event.stopImmediatePropagation();
    this.togglePopover();
  }

  protected handleDocumentClick(): void {
    if (this.mode() !== PopoverMode.CLICK || !this.toggled) {
      return;
    }
    this.togglePopover();
  }

  protected onPopoverMouseEnter(): void {
    if (this.mode() === PopoverMode.CLICK) {
      return;
    }
    this.tooltipTimeout = setTimeout(() => {
      this.isMouseOverPopover = true;
      this.triggerPopoverDirective()?.openMenu?.();
    }, 300);
  }

  protected onPopoverMouseLeave(): void {
    if (this.mode() === PopoverMode.CLICK) {
      return;
    }
    clearTimeout(this.tooltipTimeout);
    this.isMouseOverPopover = false;
    this.closePopover();
  }

  private closePopover(force = false): void {
    if (force) {
      this.triggerPopoverDirective()?.closeMenu?.();
      return;
    }

    if (!this.toggled) {
      setTimeout(() => {
        if (!this.isMouseOverPopover) {
          this.triggerPopoverDirective()?.closeMenu?.();
        }
      }, 400);
    }
  }
}
