import { Directive, HostListener, inject } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';

@Directive({
  selector: '[matTooltip]',
  standalone: false,
})
export class TooltipImmediateCloseDirective {
  private tooltip = inject(MatTooltip, { optional: true });

  @HostListener('mouseleave')
  mouseLeave(): void {
    if (!this.tooltip) {
      return;
    }
    this.tooltip.hide(0);
  }
}
