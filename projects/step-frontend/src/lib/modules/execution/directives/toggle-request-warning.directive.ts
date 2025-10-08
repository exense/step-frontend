import { Directive, effect, inject, input, signal } from '@angular/core';
import { AutorefreshToggleComponent, StandaloneMatTooltipDirective } from '@exense/step-core';
import { AggregatedTreeDataLoaderService } from '../services/aggregated-tree-data-loader.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'step-autorefresh-toggle[requestWarning]',
  exportAs: 'StepRequestWarning',
  hostDirectives: [
    {
      directive: StandaloneMatTooltipDirective,
      inputs: ['matTooltipPosition'],
    },
  ],
  host: {
    '[class.warning]': 'hasWarning()',
  },
})
export class ToggleRequestWarningDirective {
  private _treeLoader = inject(AggregatedTreeDataLoaderService);
  private _matTooltip = inject(StandaloneMatTooltipDirective, { self: true });
  private _autoRefreshToggle = inject(AutorefreshToggleComponent, { self: true });

  private hasWarningInternal = signal(false);
  readonly hasWarning = this.hasWarningInternal.asReadonly();

  readonly requestWarningMessage = input.required<string>({ alias: 'requestWarning' });

  private showWarningSubscription = this._autoRefreshToggle.refresh$
    .pipe(
      map(() => this._treeLoader.previousRequestCounter() > 1),
      takeUntilDestroyed(),
    )
    .subscribe((hasOngoingRequests) => {
      if (hasOngoingRequests) {
        this.hasWarningInternal.set(true);
      }
    });

  private effectShowTooltip = effect(() => {
    const message = this.requestWarningMessage();
    const hasWarning = this.hasWarning();
    this._matTooltip.message = hasWarning ? message : '';
  });

  resetWarning(): void {
    this.hasWarningInternal.set(false);
  }
}
