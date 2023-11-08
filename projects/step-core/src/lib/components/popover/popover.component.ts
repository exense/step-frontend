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

  @Output() toggledEvent = new EventEmitter<boolean>();

  @ViewChild(TriggerPopoverDirective, { static: true })
  private triggerPopoverDirective!: TriggerPopoverDirective;
  private toggled = false;

  protected isMouseOverPopover = false;

  @HostListener('click')
  private togglePopover(): void {
    this.toggled = !this.toggled;
    this.toggled ? this.triggerPopoverDirective.openMenu() : this.triggerPopoverDirective.closeMenu();
    this.toggledEvent.emit(this.toggled);
  }

  @HostListener('mouseenter')
  protected onPopoverMouseEnter(): void {
    this.isMouseOverPopover = true;
    this.triggerPopoverDirective.openMenu();
  }

  @HostListener('mouseleave')
  protected onPopoverMouseLeave(): void {
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
