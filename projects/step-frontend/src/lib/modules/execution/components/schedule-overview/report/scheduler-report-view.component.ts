import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { SchedulerPageStateService } from '../scheduler-page-state.service';
import { TimeRange } from '@exense/step-core';
import { DashboardUrlParamsService } from '../../../../timeseries/modules/_common/injectables/dashboard-url-params.service';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { filter, map, pairwise, scan } from 'rxjs';
import { TimeRangePickerSelection } from '../../../../timeseries/modules/_common/types/time-selection/time-range-picker-selection';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Status } from '../../../../_common/shared/status.enum';

@Component({
  selector: 'step-scheduler-report-view',
  templateUrl: './scheduler-report-view.component.html',
  styleUrls: ['./scheduler-report-view.component.scss'],
})
export class SchedulerReportViewComponent implements OnInit {
  readonly _stateService = inject(SchedulerPageStateService);
  private _urlParamsService = inject(DashboardUrlParamsService);
  private _router = inject(Router);
  private _destroyRef = inject(DestroyRef);

  private updateUrlRefreshInterval = toObservable(this._stateService.refreshInterval)
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

  private updateUrlTimeRange = this._stateService.timeRangeSelection$
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

  jumpToExecution(eId: string) {
    window.open(`#/executions/${eId!}/viz`);
  }

  handleMainChartZoom(timeRange: TimeRange) {
    timeRange = { from: Math.round(timeRange.from), to: Math.round(timeRange.to) };
    this._stateService.updateTimeRangeSelection({ type: 'ABSOLUTE', absoluteSelection: timeRange });
  }

  protected readonly availableErrorTypes = toSignal(
    this._stateService.errorsDataSource.allData$.pipe(
      map((items) => items.reduce((res, item) => [...res, ...item.types], [] as string[])),
      map((errorTypes) => Array.from(new Set(errorTypes)) as Status[]),
    ),
    { initialValue: [] },
  );

  private subscribeToBackEvents() {
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
          this._stateService.updateTimeRangeSelection(urlParams.timeRange);
        }
        this._stateService.updateRefreshInterval(urlParams.refreshInterval || 0);
      });
  }
}
