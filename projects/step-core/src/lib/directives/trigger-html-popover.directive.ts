import { Directive, Input } from '@angular/core';
import { MatMenuPanel, _MatMenuTriggerBase } from '@angular/material/menu';

@Directive({
  selector: `[triggerHtmlPopover]`,
  exportAs: 'triggerHtmlPopover',
})
export class TriggerHtmlPopoverDirective extends _MatMenuTriggerBase {
  override _handleClick(event: MouseEvent): void {}

  @Input('triggerHtmlPopover')
  override get menu(): MatMenuPanel | null {
    return super.menu;
  }

  override set menu(menu: MatMenuPanel | null) {
    super.menu = menu;
  }
}
