import { Directive, effect, inject } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';
import { OverflowIndicatorDirective } from './overflow-indicator.directive';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[matTooltip]',
  exportAs: 'matTooltip',
  host: {
    class: 'mat-mdc-tooltip-trigger',
  },
})
export class StandaloneMatTooltipDirective extends MatTooltip {}

@Directive({
  selector: '[stepOverflowTooltip]',
  hostDirectives: [
    {
      directive: StandaloneMatTooltipDirective,
      inputs: ['matTooltipPosition'],
    },
    {
      directive: OverflowIndicatorDirective,
      inputs: ['stepOverflowIndicator: stepOverflowTooltip'],
    },
  ],
})
export class OverflowTooltipDirective {
  private _matTooltip = inject(StandaloneMatTooltipDirective, { self: true });
  private _overflowIndicator = inject(OverflowIndicatorDirective, { self: true });

  private effectApplyMessage = effect(() => {
    const message = this._overflowIndicator.trackedContent();
    const hasOverflow = this._overflowIndicator.hasOverflow();
    this._matTooltip.message = hasOverflow ? message : '';
  });
}
