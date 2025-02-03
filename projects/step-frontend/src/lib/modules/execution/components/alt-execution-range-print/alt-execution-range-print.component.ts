import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { DateRangeAdapterService, DateSingleAdapterService, STEP_DATE_TIME_FORMAT_PROVIDERS } from '@exense/step-core';
import { map } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'step-alt-execution-range-print',
  templateUrl: './alt-execution-range-print.component.html',
  styleUrl: './alt-execution-range-print.component.scss',
  providers: [...STEP_DATE_TIME_FORMAT_PROVIDERS, DateSingleAdapterService, DateRangeAdapterService],
})
export class AltExecutionRangePrintComponent {
  private _activatedRoute = inject(ActivatedRoute);
  private _state = inject(AltExecutionStateService);
  private _rangeAdapter = inject(DateRangeAdapterService);

  protected readonly viewAll = this._activatedRoute.snapshot.queryParamMap.has('viewAll');
  protected fullRange = '';

  private fulLRangeSubscription = this._state.executionFulLRange$
    .pipe(
      map((range) => this._rangeAdapter.format(range, true)),
      takeUntilDestroyed(),
    )
    .subscribe((fullRange) => (this.fullRange = fullRange));
}
