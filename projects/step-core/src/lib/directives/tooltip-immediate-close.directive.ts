import { Directive, HostListener, Optional } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';

@Directive({
  selector: '[matTooltip]',
})
export class TooltipImmediateCloseDirective {
  constructor(@Optional() private tooltip?: MatTooltip) {}

  @HostListener('mouseleave')
  mouseLeave(): void {
    if (!this.tooltip) {
      return;
    }
    this.tooltip.hide(0);
  }
}
