import { Directive, effect, inject } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';
import { OverflowIndicatorDirective } from './overflow-indicator.directive';

@Directive({
  selector: '[matTooltip]',
  standalone: true,
  exportAs: 'matTooltip',
  host: {
    class: 'mat-mdc-tooltip-trigger',
  },
})
export class StandaloneMatTooltipDirective extends MatTooltip {}

@Directive({
  selector: '[stepOverflowTooltip]',
  standalone: true,
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
