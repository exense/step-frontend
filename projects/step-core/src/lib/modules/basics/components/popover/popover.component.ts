import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { TriggerPopoverDirective } from '../../directives/trigger-popover.directive';
import { MatMenu } from '@angular/material/menu';

export enum PopoverMode {
  BOTH,
  HOVER,
  CLICK,
}

@Component({
  selector: 'step-popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'StepPopover',
  encapsulation: ViewEncapsulation.None,
})
export class PopoverComponent {
  @Input() xPosition: MatMenu['xPosition'] = 'after';
  @Input() yPosition: MatMenu['yPosition'] = 'above';
  @Input() noPadding = false;
  @Input() mode = PopoverMode.BOTH;

  @Output() toggledEvent = new EventEmitter<boolean>();

  @ViewChild(TriggerPopoverDirective, { static: true })
  private triggerPopoverDirective!: TriggerPopoverDirective;
  private toggled = false;
  private tooltipTimeout?: ReturnType<typeof setTimeout>;

  protected isMouseOverPopover = false;

  private togglePopover(): void {
    this.toggled = !this.toggled;
    this.toggled ? this.triggerPopoverDirective.openMenu() : this.triggerPopoverDirective.closeMenu();
    this.toggledEvent.emit(this.toggled);
  }

  @HostListener('click', ['$event'])
  private handleClick($event: MouseEvent): void {
    if (this.mode === PopoverMode.HOVER) {
      return;
    }
    $event.preventDefault();
    $event.stopImmediatePropagation();
    this.togglePopover();
  }

  @HostListener('document:click')
  private handleDocumentClick(): void {
    if (this.mode !== PopoverMode.CLICK || !this.toggled) {
      return;
    }
    this.togglePopover();
  }

  @HostListener('mouseenter')
  protected onPopoverMouseEnter(): void {
    if (this.mode === PopoverMode.CLICK) {
      return;
    }
    this.tooltipTimeout = setTimeout(() => {
      this.isMouseOverPopover = true;
      this.triggerPopoverDirective.openMenu();
    }, 300);
  }

  @HostListener('mouseleave')
  protected onPopoverMouseLeave(): void {
    if (this.mode === PopoverMode.CLICK) {
      return;
    }
    clearTimeout(this.tooltipTimeout);
    this.isMouseOverPopover = false;
    this.closePopover();
  }

  private closePopover(force = false): void {
    if (force) {
      this.triggerPopoverDirective.closeMenu();
      return;
    }

    if (!this.toggled) {
      setTimeout(() => {
        if (!this.isMouseOverPopover) {
          this.triggerPopoverDirective.closeMenu();
        }
      }, 400);
    }
  }
}
