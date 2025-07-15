import { Component, DestroyRef, inject, OnInit, Signal, signal, ViewEncapsulation } from '@angular/core';
import {
  DashboardUrlParams,
  DashboardUrlParamsService,
} from '../../../timeseries/modules/_common/injectables/dashboard-url-params.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AugmentedSchedulerService,
  AugmentedTimeSeriesService,
  BucketResponse,
  DialogParentService,
  Execution,
  ExecutionsService,
  ExecutiontTaskParameters,
  FetchBucketsRequest,
  IS_SMALL_SCREEN,
  STATUS_COLORS,
  Tab,
  TimeRange,
  TimeUnit,
} from '@exense/step-core';
import { SCHEDULE_ID } from '../../services/schedule-id.token';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { filter, map, Observable, of, shareReplay, startWith, Subject, switchMap, take } from 'rxjs';
import { TimeRangePickerSelection } from '../../../timeseries/modules/_common/types/time-selection/time-range-picker-selection';
import { SchedulerPageStateService } from './scheduler-page-state.service';
import { FilterBarItem, FilterBarItemType } from '../../../timeseries/time-series.module';
import { ReportNodeSummary } from '../../shared/report-node-summary';
import { VIEW_MODE, ViewMode } from '../../shared/view-mode';
import { TimeSeriesConfig, TimeSeriesUtils } from '../../../timeseries/modules/_common';
import { TSChartSeries, TSChartSettings } from '../../../timeseries/modules/chart';
import { Status } from '../../../_common/shared/status.enum';
import { Axis, Band } from 'uplot';
import PathBuilder = uPlot.Series.Points.PathBuilder;

declare const uPlot: any;

interface EntityWithKeywordsStats {
  entity: string;
  timestamp: number;
  statuses: Record<string, number>;
}

@Component({
  selector: 'step-scheduler-page',
  templateUrl: './scheduler-page.component.html',
  styleUrls: ['./scheduler-page.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    DashboardUrlParamsService,
    {
      provide: SCHEDULE_ID,
      useFactory: () => {
        const _activatedRoute = inject(ActivatedRoute);
        return () => _activatedRoute.snapshot.params?.['id'] ?? '';
      },
    },
    {
      provide: SchedulerPageStateService,
      useExisting: SchedulerPageComponent,
    },
    {
      provide: VIEW_MODE,
      useFactory: () => {
        const _activatedRoute = inject(ActivatedRoute);
        return (_activatedRoute.snapshot.data['mode'] ?? ViewMode.VIEW) as ViewMode;
      },
    },
    {
      provide: DialogParentService,
      useExisting: SchedulerPageComponent,
    },
  ],
  standalone: false,
})
export class SchedulerPageComponent extends SchedulerPageStateService implements OnInit, DialogParentService {
  private _urlParamsService = inject(DashboardUrlParamsService);
  readonly _isSmallScreen$ = inject(IS_SMALL_SCREEN);
  readonly _taskIdFn = inject(SCHEDULE_ID);
  private _destroyRef = inject(DestroyRef);
  private _schedulerService = inject(AugmentedSchedulerService);
  private _timeSeriesService = inject(AugmentedTimeSeriesService);
  private bars: PathBuilder = uPlot.paths.bars({ size: [0.6, 100], align: 1 });
  private _statusColors = inject(STATUS_COLORS);
  private _executionService = inject(ExecutionsService);
  private _router = inject(Router);
  protected readonly _activatedRoute = inject(ActivatedRoute);

  readonly taskId = signal(new String(this._taskIdFn()));

  protected readonly taskId$ = toObservable(this.taskId);

  protected readonly task$ = this.taskId$.pipe(
    switchMap((id) => this._schedulerService.getExecutionTaskById(id.toString())),
  );

  protected readonly task: Signal<ExecutiontTaskParameters | undefined> = toSignal(this.task$);

  refreshInterval = signal<number>(0);
  protected readonly activeTimeRangeSelection = signal<TimeRangePickerSelection | undefined>(undefined);

  timeRangeSelection$: Observable<TimeRangePickerSelection> = toObservable(this.activeTimeRangeSelection).pipe(
    filter((value): value is TimeRangePickerSelection => value != null),
  );

  updateTimeRangeSelection(selection: TimeRangePickerSelection) {
    this.activeTimeRangeSelection.set(selection);
  }

  updateRefreshInterval(interval: number): void {
    this.refreshInterval.set(interval);
  }

  readonly timeRange$: Observable<TimeRange> = this.timeRangeSelection$.pipe(
    map((rangeSelection) => {
      switch (rangeSelection.type) {
        case 'FULL':
          throw new Error('Full range is not supported');
        case 'ABSOLUTE':
          return rangeSelection.absoluteSelection!;
        case 'RELATIVE':
          const endTime = new Date().getTime();
          return { from: endTime - rangeSelection.relativeSelection!.timeInMs, to: endTime };
      }
    }),
    filter((range): range is TimeRange => range !== undefined),
    shareReplay(1),
  ) as Observable<TimeRange>;

  private readonly fetchLastExecutionTrigger$ = new Subject<void>();

  readonly lastExecution$: Observable<{ execution: Execution | null }> = this.fetchLastExecutionTrigger$.pipe(
    startWith(undefined),
    switchMap(() => this._executionService.getLastExecutionsByTaskId(this._taskIdFn(), 1, undefined, undefined)),
    map((executions) => ({ execution: executions[0] || null })),
    shareReplay(1),
  );

  readonly summaryData$: Observable<ReportNodeSummary> = this.timeRange$.pipe(
    switchMap((timeRange) => {
      const request: FetchBucketsRequest = {
        start: timeRange.from,
        end: timeRange.to,
        numberOfBuckets: 1,
        oqlFilter: `attributes.metricType = \"executions/duration\" and attributes.taskId = ${this._taskIdFn()}`,
        groupDimensions: ['result'],
      };
      return this._timeSeriesService.getTimeSeries(request).pipe(
        map((response) => {
          let total = 0;
          const items: { [key: string]: number } = {};
          response.matrixKeys.forEach((keyAttributes, i) => {
            let bucket: BucketResponse = response.matrix[i][0];
            items[keyAttributes['result'] as string] = bucket.count;
            total += bucket.count;
          });
          return { items: items, total: total };
        }),
      );
    }),
  );

  readonly executionsChartSettings$ = this.timeRange$.pipe(
    switchMap((timeRange) => {
      const taskId = this._taskIdFn();
      const statusAttribute = 'result';
      const request: FetchBucketsRequest = {
        start: timeRange.from,
        end: timeRange.to,
        numberOfBuckets: 30, // good amount of bars visually
        oqlFilter: `attributes.metricType = \"executions/duration\" and attributes.taskId = ${taskId}`,
        groupDimensions: [statusAttribute],
      };
      return this._timeSeriesService.getTimeSeries(request).pipe(
        map((response) => {
          const xLabels = TimeSeriesUtils.createTimeLabels(response.start, response.end, response.interval);
          let series: TSChartSeries[] = response.matrix.map((seriesBuckets: BucketResponse[], i: number) => {
            const seriesKey: string = response.matrixKeys[i][statusAttribute];
            const seriesData: (number | undefined | null)[] = [];
            seriesBuckets.forEach((b, i) => {
              let value = b?.count || 0;
              seriesData[i] = value;
            });
            let color = this._statusColors[seriesKey as Status];
            const fill = color + 'cc';
            const s: TSChartSeries = {
              id: seriesKey,
              scale: 'y',
              labelItems: [seriesKey],
              legendName: seriesKey,
              data: seriesData,
              width: 1,
              value: (self: uPlot, rawValue: number, seriesIdx: number, idx: number) =>
                this.calculateStackedValue(self, rawValue, seriesIdx, idx),
              stroke: color,
              fill: fill,
              paths: this.bars,
              points: { show: false },
              show: true,
            };
            return s;
          });
          this.cumulateSeriesData(series); // used for stacked bar

          const axes: Axis[] = [
            {
              size: TimeSeriesConfig.CHART_LEGEND_SIZE,
              scale: 'y',
              values: (u, vals) => {
                return vals.map((v: any) => v);
              },
            },
          ];
          return {
            title: '',
            showLegend: false,
            showDefaultLegend: true,
            xAxesSettings: {
              values: xLabels,
              valueFormatFn: (self, rawValue: number, seriesIdx) => new Date(rawValue).toLocaleString(),
            },
            cursor: {
              lock: true,
              dataIdx: (self: uPlot, seriesIdx: number, closestIdx: number, xValue: number) => {
                let timeItems = self.data[0];
                const closestValue = timeItems[closestIdx];
                if (closestValue <= xValue) {
                  return closestIdx;
                } else {
                  return closestIdx - 1;
                }
              },
            },
            scales: {
              y: {
                range: (self: uPlot, initMin: number, initMax: number, scaleKey: string) => {
                  return [0, initMax];
                },
              },
            },
            series: series,
            tooltipOptions: {
              enabled: true,
            },
            axes: axes,
            bands: this.getDefaultBands(series.length),
          } as TSChartSettings;
        }),
      );
    }),
  );

  readonly lastExecutionsSorted$ = this.timeRange$.pipe(
    switchMap((timeRange) => {
      let taskId = this._taskIdFn();
      return this._executionService
        .getLastExecutionsByTaskId(taskId, this.LAST_EXECUTIONS_TO_DISPLAY, timeRange.from, timeRange.to)
        .pipe(
          map((executions) => {
            executions.sort((a, b) => a.startTime! - b.startTime!);
            return executions;
          }),
        );
    }),
    shareReplay(1),
  );

  readonly keywordsChartSettings$ = this.lastExecutionsSorted$.pipe(
    switchMap((executions) => {
      return this.timeRange$.pipe(
        take(1),
        switchMap((timeRange) => {
          const statusAttribute = 'status';
          const executionIdAttribute = 'executionId';
          if (executions.length === 0) {
            return of(this.createKeywordsChart([], []));
          } else {
            const executionsIdsJoined =
              executions.map((e) => `attributes.${executionIdAttribute} = ${e.id!}`).join(' or ') || '1 = 1';
            const request: FetchBucketsRequest = {
              start: timeRange.from,
              end: timeRange.to,
              numberOfBuckets: 1,
              oqlFilter: `(attributes.type = CallFunction) and (${executionsIdsJoined})`,
              groupDimensions: [executionIdAttribute, statusAttribute],
            };

            return this._timeSeriesService.getReportNodesTimeSeries(request).pipe(
              map((timeSeriesResponse) => {
                let executionStats: Record<string, EntityWithKeywordsStats> = {};
                const allStatuses = new Set<string>();
                timeSeriesResponse.matrixKeys.forEach((attributes, i) => {
                  const executionId = attributes[executionIdAttribute];
                  const status = attributes[statusAttribute];
                  allStatuses.add(status);
                  let executionEntry: EntityWithKeywordsStats = {
                    entity: executionId,
                    statuses: {},
                    timestamp: 0,
                  };
                  if (executionStats[executionId]) {
                    executionEntry = executionStats[executionId];
                  } else {
                    executionStats[executionId] = executionEntry;
                  }
                  timeSeriesResponse.matrix[i].forEach((bucket) => {
                    if (bucket) {
                      const newCount = (executionEntry.statuses[status] || 0) + (bucket.count || 0);
                      executionEntry.statuses[status] = newCount;
                    }
                  });
                });
                if (timeSeriesResponse.matrixKeys.length === 0) {
                  // add a default series when there is no data
                  allStatuses.add('PASSED');
                }
                let series: TSChartSeries[] = Array.from(allStatuses).map((status) => {
                  let color = this._statusColors[status as Status];
                  const fill = color + 'cc';
                  const s: TSChartSeries = {
                    id: status,
                    scale: 'y',
                    labelItems: [status],
                    legendName: status,
                    data: executions.map((item) => executionStats[item.id!]?.statuses[status] || 0),
                    width: 1,
                    value: (self: uPlot, rawValue: number, seriesIdx: number, idx: number) =>
                      this.calculateStackedValue(self, rawValue, seriesIdx, idx),
                    stroke: color,
                    fill: fill,
                    paths: this.bars,
                    points: { show: false },
                    show: true,
                  };
                  return s;
                });
                this.cumulateSeriesData(series);
                return this.createKeywordsChart(executions, series);
              }),
            );
          }
        }),
        map((chartSettings) => ({ chartSettings: chartSettings, lastExecutions: executions })),
      );
    }),
  );

  readonly testCasesChartSettings$ = this.lastExecutionsSorted$.pipe(
    switchMap((executions) => {
      return this.timeRange$.pipe(
        take(1),
        switchMap((timeRange) => {
          if (executions.length === 0) {
            return of(this.createTestCasesChart([], []));
          } else {
            const executionsIdsJoined = executions.map((e) => `attributes.executionId = ${e.id!}`).join(' or ');
            let oqlFilter = 'attributes.type = TestCase';
            if (executionsIdsJoined) {
              oqlFilter += ` and (${executionsIdsJoined})`;
            }
            const request: FetchBucketsRequest = {
              start: timeRange.from,
              end: timeRange.to,
              numberOfBuckets: 1,
              oqlFilter: oqlFilter,
              groupDimensions: ['executionId', 'status'],
            };

            return this._timeSeriesService.getReportNodesTimeSeries(request).pipe(
              map((timeSeriesResponse) => {
                let statsByNodes: Record<string, EntityWithKeywordsStats> = {};
                const allStatuses = new Set<string>();
                if (timeSeriesResponse.matrixKeys.length === 0) {
                  // add a default series when there is no data
                  allStatuses.add('PASSED');
                }
                timeSeriesResponse.matrixKeys.forEach((attributes, i) => {
                  // const nodeName = attributes['name'];
                  // let artefactHash = attributes['artefactHash'];
                  const executionId = attributes['executionId'];
                  const status = attributes['status'];
                  // const nodeUniqueId = nodeName + artefactHash;

                  allStatuses.add(status);
                  let executionEntry: EntityWithKeywordsStats = {
                    entity: executionId,
                    statuses: {},
                    timestamp: 0,
                  };
                  if (statsByNodes[executionId]) {
                    executionEntry = statsByNodes[executionId];
                  } else {
                    statsByNodes[executionId] = executionEntry;
                  }
                  timeSeriesResponse.matrix[i].forEach((bucket) => {
                    if (bucket) {
                      const newCount = (executionEntry.statuses[status] || 0) + (bucket.count || 0);
                      executionEntry.statuses[status] = newCount;
                    }
                  });
                });
                let series = Array.from(allStatuses).map((status) => {
                  let color = this._statusColors[status as Status];
                  const fill = color + 'cc';
                  const s: TSChartSeries = {
                    id: status,
                    scale: 'y',
                    labelItems: [status],
                    legendName: status,
                    data: executions.map((item) => statsByNodes[item.id!]?.statuses[status] || 0),
                    width: 1,
                    value: (self: uPlot, rawValue: number, seriesIdx: number, idx: number) =>
                      this.calculateStackedValue(self, rawValue, seriesIdx, idx),
                    stroke: color,
                    fill: fill,
                    paths: this.bars,
                    points: { show: false },
                    show: true,
                  };
                  return s;
                });
                this.cumulateSeriesData(series);
                return this.createTestCasesChart(executions, series);
              }),
            );
          }
        }),
        map((chartSettings) => ({ chartSettings: chartSettings, lastExecutions: executions })),
      );
    }),
  );

  readonly errorsDataSource = this._timeSeriesService.createErrorsDataSource();

  errorTableRefreshSub = this.timeRange$.subscribe((timeRange) => {
    this.errorsDataSource.reload({ request: { timeRange: timeRange, taskId: this._taskIdFn() } });
  });

  protected tabs: Tab<string>[] = [this.createTab('report', 'Report'), this.createTab('performance', 'Performance')];

  readonly timeRangeOptions: TimeRangePickerSelection[] = [
    { type: 'RELATIVE', relativeSelection: { label: 'Last 1 day', timeInMs: TimeUnit.DAY } },
    { type: 'RELATIVE', relativeSelection: { label: 'Last 1 week', timeInMs: TimeUnit.WEEK } },
    { type: 'RELATIVE', relativeSelection: { label: 'Last 2 weeks', timeInMs: TimeUnit.WEEK * 2 } },
    { type: 'RELATIVE', relativeSelection: { label: 'Last 1 month', timeInMs: TimeUnit.MONTH } },
    { type: 'RELATIVE', relativeSelection: { label: 'Last 3 months', timeInMs: TimeUnit.MONTH * 3 } },
    { type: 'RELATIVE', relativeSelection: { label: 'Last 6 months', timeInMs: TimeUnit.MONTH * 6 } },
    { type: 'RELATIVE', relativeSelection: { label: 'Last 1 year', timeInMs: TimeUnit.YEAR } },
    { type: 'RELATIVE', relativeSelection: { label: 'Last 3 years', timeInMs: TimeUnit.YEAR * 3 } },
  ];

  ngOnInit(): void {
    const urlParams = this._urlParamsService.collectUrlParams();
    this.updateTimeAndRefresh(urlParams);
  }

  dialogSuccessfullyClosed(): void {
    this.taskId.set(new String(this._taskIdFn()));
  }

  protected configureSchedule(): void {
    this._router.navigate([{ outlets: { modal: 'configure' } }], {
      relativeTo: this._activatedRoute,
      queryParamsHandling: 'preserve',
    });
  }

  getDashboardFilters(): FilterBarItem[] {
    return [
      { attributeName: 'taskId', type: FilterBarItemType.TASK, searchEntities: [{ searchValue: this._taskIdFn() }] },
    ];
  }

  triggerRefresh() {
    this.activeTimeRangeSelection.set({ ...this.activeTimeRangeSelection()! });
    this.fetchLastExecutionTrigger$.next();
  }

  handleRefreshIntervalChange(interval: number) {
    this.refreshInterval.set(interval);
  }

  handleTimeRangeChange(selection: TimeRangePickerSelection) {
    this.activeTimeRangeSelection.set(selection);
  }

  private updateTimeAndRefresh(urlParams: DashboardUrlParams) {
    if (urlParams.refreshInterval === undefined) {
      urlParams.refreshInterval = 0;
    }
    this.refreshInterval.set(urlParams.refreshInterval!);
    if (urlParams.timeRange) {
      let urlTimeRange = urlParams.timeRange!;
      // if (urlTimeRange.type === 'RELATIVE') {
      //   urlTimeRange = this.findRelativeTimeOption(urlTimeRange?.relativeSelection?.timeInMs);
      // }
      this.activeTimeRangeSelection.set(urlTimeRange);
    } else {
      this.activeTimeRangeSelection.set(this.timeRangeOptions[1]);
    }
  }

  // protected readonly task = toSignal(this.task$, { initialValue: undefined });

  private createTab(id: string, label: string, link?: string): Tab<string> {
    return {
      id,
      label,
      link: [{ outlets: { primary: link ?? id, modal: null, nodeDetails: null } }],
    };
  }

  private getDefaultBands(count: number): Band[] {
    const bands: Band[] = [];
    for (let i = count; i > 1; i--) {
      bands.push({ series: [i, i - 1] });
    }
    return bands;
  }

  private cumulateSeriesData(series: TSChartSeries[]): void {
    series.forEach((s, i) => {
      if (i == 0) {
        return;
      }
      s.data.forEach((point, j) => {
        const previousSeriesValue: number = series[i - 1].data[j]!;
        s.data[j] = previousSeriesValue + (s.data[j]! as number);
      });
    });
  }

  private calculateStackedValue(self: uPlot, currentValue: number, seriesIdx: number, idx: number): number {
    if (seriesIdx > 1) {
      const valueBelow = self.data[seriesIdx - 1][idx] || 0;
      return currentValue - valueBelow;
    }
    return currentValue;
  }

  private createKeywordsChart(executions: Execution[], series: TSChartSeries[]): TSChartSettings {
    const axes: Axis[] = [
      {
        size: TimeSeriesConfig.CHART_LEGEND_SIZE,
        scale: 'y',
        values: (u, vals) => vals,
        incrs: [1],
      },
    ];

    return {
      title: '',
      showLegend: false,
      showDefaultLegend: true,
      xAxesSettings: {
        time: false,
        label: 'Execution',
        show: false,
        values: executions.map((item, i) => i),
        valueFormatFn: (uPlot, rawValue, seriesIdx, idx) => {
          return executions[idx].description!;
        },
      },
      cursor: {
        lock: true,
      },
      scales: {
        y: {
          range: (self: uPlot, initMin: number, initMax: number, scaleKey: string) => {
            return [0, Math.max(initMax, 5)];
          },
        },
      },
      series: series,
      tooltipOptions: {
        enabled: true,
      },
      axes: axes,
      bands: this.getDefaultBands(series.length),
      zoomEnabled: false,
    };
  }

  private createTestCasesChart(executions: Execution[], series: TSChartSeries[]): TSChartSettings | null {
    if (executions.length === 0) {
      return null;
    }
    const axes: Axis[] = [
      {
        size: TimeSeriesConfig.CHART_LEGEND_SIZE,
        scale: 'y',
        values: (u, vals) => vals,
        incrs: [1],
      },
    ];
    return {
      title: '',
      showLegend: false,
      showDefaultLegend: true,
      xAxesSettings: {
        time: false,
        label: 'Execution',
        show: false,
        values: executions.map((item, i) => i),
        valueFormatFn: (uPlot, rawValue, seriesIdx, idx) => {
          return executions[idx].description!;
        },
      },
      cursor: {
        lock: true,
      },
      scales: {
        y: {
          range: (self: uPlot, initMin: number, initMax: number, scaleKey: string) => {
            return [0, Math.max(initMax, 5)];
          },
        },
      },
      series: series,
      tooltipOptions: {
        enabled: true,
      },
      axes: axes,
      bands: this.getDefaultBands(series.length),
      zoomEnabled: false,
    };
  }
}
