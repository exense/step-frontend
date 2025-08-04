import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Tab, TimeRange } from '@exense/step-core';
import { DashboardUrlParamsService } from '../../../../../timeseries/modules/_common/injectables/dashboard-url-params.service';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, filter, map, pairwise, scan, take } from 'rxjs';
import { TimeRangePickerSelection } from '../../../../../timeseries/modules/_common/types/time-selection/time-range-picker-selection';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Status } from '../../../../../_common/shared/status.enum';
import { CrossExecutionDashboardState } from '../cross-execution-dashboard-state';

export type ReportNodesChartType = 'keywords' | 'testcases';

@Component({
  selector: 'step-scheduler-report-view',
  templateUrl: './scheduler-report-view.component.html',
  styleUrls: ['./scheduler-report-view.component.scss'],
})
export class SchedulerReportViewComponent implements OnInit {
  readonly _state = inject(CrossExecutionDashboardState);
  private _urlParamsService = inject(DashboardUrlParamsService);
  private _router = inject(Router);
  private _destroyRef = inject(DestroyRef);

  readonly reportNodesChartType = signal<ReportNodesChartType | undefined>(undefined);

  readonly primaryChartTypes: Tab<ReportNodesChartType>[] = [
    {
      id: 'testcases',
      label: 'Test Cases',
    },
    {
      id: 'keywords',
      label: 'Keywords',
    },
  ];

  switchReportNodesChart(type: ReportNodesChartType) {
    this.reportNodesChartType.set(type);
  }

  readonly byExecutionChartTitle = computed(() => {
    const label =
      this.reportNodesChartType() === 'keywords' ? 'Keywords calls by execution' : 'Test cases by execution';
    return `${label} (last ${this._state.LAST_EXECUTIONS_TO_DISPLAY})`;
  });

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

    this._state.testCasesChartSettings$.pipe(take(1)).subscribe(({ hasData }) => {
      this.reportNodesChartType.set(hasData ? 'testcases' : 'keywords');
    });
  }

  jumpToExecution(eId: string) {
    window.open(`#/executions/${eId!}/report`);
  }

  handleMainChartZoom(timeRange: TimeRange) {
    this._state.executionsChartSettings$.pipe(take(1)).subscribe((chartSettings) => {
      const base = chartSettings.xAxesSettings.values[0];
      const interval = chartSettings.xAxesSettings.values[1] - chartSettings.xAxesSettings.values[0];
      const snappedFrom = base + Math.ceil((timeRange.from - base) / interval) * interval;
      const snappedTo = base + Math.ceil((timeRange.to - base) / interval) * interval;
      timeRange = { from: Math.round(snappedFrom), to: Math.round(snappedTo) };
      this._state.updateTimeRangeSelection({ type: 'ABSOLUTE', absoluteSelection: timeRange });
    });
  }

  protected readonly availableErrorTypes = toSignal(
    this._state.errorsDataSource.allData$.pipe(
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
          this._state.updateTimeRangeSelection(urlParams.timeRange);
        }
        this._state.updateRefreshInterval(urlParams.refreshInterval || 0);
      });
  }
}
