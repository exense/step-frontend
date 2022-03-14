import { Directive, ElementRef, Injector, Input } from '@angular/core';
import { UpgradeComponent } from '@angular/upgrade/static';

@Directive({
  selector: 'step-tooltip',
})
export class TooltipDirective extends UpgradeComponent {
  constructor(el: ElementRef, injector: Injector) {
    super('stepTooltip', el, injector);
  }

  @Input() tooltip: string = '';
  @Input() appendToBody?: boolean;
}
