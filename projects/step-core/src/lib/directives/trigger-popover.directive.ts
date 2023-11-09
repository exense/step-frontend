import { Directive, Input } from '@angular/core';
import { MatMenuPanel, _MatMenuTriggerBase } from '@angular/material/menu';

@Directive({
  selector: `[stepTriggerPopover]`,
  exportAs: 'stepTriggerPopover',
})
export class TriggerPopoverDirective extends _MatMenuTriggerBase {
  override _handleClick(event: MouseEvent): void {}

  @Input('stepTriggerPopover')
  override get menu(): MatMenuPanel | null {
    return super.menu;
  }

  override set menu(menu: MatMenuPanel | null) {
    super.menu = menu;
  }
}
