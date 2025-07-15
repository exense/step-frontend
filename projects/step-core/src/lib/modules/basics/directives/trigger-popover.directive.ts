import { Directive, Input } from '@angular/core';
import { MatMenuPanel, MatMenuTrigger } from '@angular/material/menu';

@Directive({
  selector: `[stepTriggerPopover]`,
  exportAs: 'stepTriggerPopover',
  standalone: false,
})
export class TriggerPopoverDirective extends MatMenuTrigger {
  override _handleClick(event: MouseEvent): void {}

  @Input('stepTriggerPopover')
  override get menu(): MatMenuPanel | null {
    return super.menu;
  }

  override set menu(menu: MatMenuPanel | null) {
    super.menu = menu;
  }
}
