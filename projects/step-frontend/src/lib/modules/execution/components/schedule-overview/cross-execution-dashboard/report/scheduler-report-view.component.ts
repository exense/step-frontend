import { Component, DestroyRef, inject, OnInit} from '@angular/core';
import { DateRange, TableIndicatorMode} from '@exense/step-core';
import { DashboardUrlParamsService } from '../../../../../timeseries/modules/_common/injectables/dashboard-url-params.service';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { filter, map, pairwise, scan} from 'rxjs';
import { TimeRangePickerSelection } from '../../../../../timeseries/modules/_common/types/time-selection/time-range-picker-selection';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Status } from '../../../../../_common/shared/status.enum';
import { CrossExecutionDashboardState } from '../cross-execution-dashboard-state';
import { DateTime } from 'luxon';

@Component({
  selector: 'step-scheduler-report-view',
  templateUrl: './scheduler-report-view.component.html',
  styleUrls: ['./scheduler-report-view.component.scss'],
  standalone: false,
})
export class SchedulerReportViewComponent implements OnInit {
  protected readonly _state = inject(CrossExecutionDashboardState);
  private _urlParamsService = inject(DashboardUrlParamsService);
  private _router = inject(Router);
  private _destroyRef = inject(DestroyRef);

  protected readonly TableIndicatorMode = TableIndicatorMode;

  protected readonly luxonDateRange = toSignal(
    this._state.timeRange$.pipe(
      map(
        ({ from, to }) =>
          ({
            start: DateTime.fromMillis(from),
            end: DateTime.fromMillis(to),
          }) as DateRange,
      ),
    ),
  );

  private updateUrlRefreshInterval = toObservable(this._state.refreshInterval)
    .pipe(
      scan(
        (acc, interval) => {
          const isFirst = !acc.hasEmitted;
          return { range: interval, isFirst, hasEmitted: true };
        },
        { range: null as unknown as number, isFirst: true, hasEmitted: false },
      ),
      takeUntilDestroyed(),
    )
    .subscribe(({ range, isFirst }: { range: number; isFirst: boolean }) => {
      this._urlParamsService.updateRefreshInterval(range, isFirst);
    });

  private updateUrlTimeRange = this._state.timeRangeSelection$
    .pipe(
      scan(
        (acc, range) => {
          const isFirst = !acc.hasEmitted;
          return { range, isFirst, hasEmitted: true };
        },
        { range: null as unknown as TimeRangePickerSelection, isFirst: true, hasEmitted: false },
      ),
      takeUntilDestroyed(),
    )
    .subscribe(({ range, isFirst }: { range: TimeRangePickerSelection; isFirst: boolean }) => {
      this._urlParamsService.patchUrlParams(range, undefined, isFirst);
    });

  ngOnInit(): void {
    this.subscribeToBackEvents();
  }

  protected readonly availableErrorTypes = toSignal(
    this._state.errorsDataSource.allData$.pipe(
      map((items) => items.reduce((res, item) => [...res, ...item.types], [] as string[])),
      map((errorTypes) => Array.from(new Set(errorTypes)) as Status[]),
    ),
    { initialValue: [] },
  );

  private subscribeToBackEvents(): void {
    // subscribe to back and forward events
    this._router.events
      .pipe(
        takeUntilDestroyed(this._destroyRef),
        filter((event) => event instanceof NavigationStart || event instanceof NavigationEnd),
        pairwise(), // Gives us [previousEvent, currentEvent]
        filter(
          ([prev, curr]) =>
            prev instanceof NavigationStart && curr instanceof NavigationEnd && prev.navigationTrigger === 'popstate',
        ),
      )
      .subscribe(() => {
        // analytics tab is handling events itself
        let urlParams = this._urlParamsService.collectUrlParams();
        if (urlParams.timeRange) {
          this._state.updateTimeRangeSelection(urlParams.timeRange);
        }
        this._state.updateRefreshInterval(urlParams.refreshInterval || 0);
      });
  }
}
