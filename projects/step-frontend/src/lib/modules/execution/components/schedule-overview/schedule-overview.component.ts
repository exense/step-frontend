import { Component, computed, effect, inject, OnInit, Signal, signal } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  AugmentedSchedulerService,
  BucketResponse,
  Execution,
  ExecutionsService,
  FetchBucketsRequest,
  Plan,
  STATUS_COLORS,
  TimeRange,
  TimeUnit,
  AugmentedTimeSeriesService,
  SchedulerOverviewTaskChangeService,
  ExecutiontTaskParameters,
} from '@exense/step-core';
import { map, Observable, of, shareReplay, switchMap } from 'rxjs';
import { ReportNodeSummary } from '../../shared/report-node-summary';
import { VIEW_MODE, ViewMode } from '../../shared/view-mode';
import { TSChartSeries, TSChartSettings } from '../../../timeseries/modules/chart';
import { Status } from '../../../_common/shared/status.enum';
import { TimeSeriesConfig, TimeSeriesUtils } from '../../../timeseries/modules/_common';
import { Axis, Band } from 'uplot';
import PathBuilder = uPlot.Series.Points.PathBuilder;
import { TimeRangePickerSelection } from '../../../timeseries/modules/_common/types/time-selection/time-range-picker-selection';
import { toSignal } from '@angular/core/rxjs-interop';
import { DashboardUrlParamsService } from '../../../timeseries/modules/_common/injectables/dashboard-url-params.service';

declare const uPlot: any;

interface UrlParams {
  timeRangeSelection?: TimeRangePickerSelection;
  refresh: number;
}

interface EntityWithKeywordsStats {
  entity: string;
  timestamp: number;
  statuses: Record<string, number>;
}

@Component({
  selector: 'step-schedule-overview',
  templateUrl: './schedule-overview.component.html',
  styleUrls: ['./schedule-overview.component.scss'],
  providers: [
    DashboardUrlParamsService,
    {
      provide: VIEW_MODE,
      useFactory: () => {
        const _activatedRoute = inject(ActivatedRoute);
        return (_activatedRoute.snapshot.data['mode'] ?? ViewMode.VIEW) as ViewMode;
      },
    },
  ],
})
export class ScheduleOverviewComponent {
  readonly LAST_EXECUTIONS_TO_DISPLAY = 30;
  readonly URL_PARAMS_PREFIX = 'dc_';
  private _urlParamService = inject(DashboardUrlParamsService);
  private _scheduleApi = inject(AugmentedSchedulerService);
  private _activatedRoute = inject(ActivatedRoute);
  private _timeSeriesService = inject(AugmentedTimeSeriesService);
  private _executionService = inject(ExecutionsService);
  protected _taskId = inject(ActivatedRoute).snapshot.params['id']! as string;
  private _statusColors = inject(STATUS_COLORS);
  private _scheduleOverviewTaskChange = inject(SchedulerOverviewTaskChangeService);
  private _router = inject(Router);

  readonly timeRangeOptions: TimeRangePickerSelection[] = [
    { type: 'RELATIVE', relativeSelection: { label: 'Last day', timeInMs: TimeUnit.DAY } },
    { type: 'RELATIVE', relativeSelection: { label: 'Last week', timeInMs: TimeUnit.DAY * 7 } },
    { type: 'RELATIVE', relativeSelection: { label: 'Last 2 weeks', timeInMs: TimeUnit.DAY * 14 } },
    { type: 'RELATIVE', relativeSelection: { label: 'Last month', timeInMs: TimeUnit.DAY * 30 } },
    { type: 'RELATIVE', relativeSelection: { label: 'Last 3 months', timeInMs: TimeUnit.DAY * 30 * 3 } },
    { type: 'RELATIVE', relativeSelection: { label: 'Last 6 months', timeInMs: TimeUnit.DAY * 30 * 6 } },
    { type: 'RELATIVE', relativeSelection: { label: 'Last year', timeInMs: TimeUnit.DAY * 365 } },
    { type: 'RELATIVE', relativeSelection: { label: 'Last 3 years', timeInMs: TimeUnit.DAY * 365 * 3 } },
  ];

  // generate bar builder with 60% bar (40% gap) & 100px max bar width
  private bars: PathBuilder = uPlot.paths.bars({ size: [0.6, 100] });

  protected plan?: Partial<Plan>;
  protected error = '';
  protected repositoryId?: string;

  protected taskId$ = this._activatedRoute.params.pipe(map((params) => params['id'] as string));

  private task$ = this.taskId$.pipe(
    switchMap((taskId) => (!taskId ? of(undefined) : this._scheduleApi.getExecutionTaskById(taskId))),
  );

  protected readonly taskId = toSignal(this.taskId$, { initialValue: this._activatedRoute.snapshot.params['id'] });
  protected readonly task = toSignal(this.task$, { initialValue: undefined });
  protected readonly activeTimeRangeSelection = signal<TimeRangePickerSelection | undefined>(undefined);

  refreshInterval = signal<number>(0);

  protected readonly timeRange: Signal<TimeRange | undefined> = computed(() => {
    let selection = this.activeTimeRangeSelection();
    if (selection) {
      return this.calculateTimeRange(selection);
    } else {
      return undefined;
    }
  });

  urlUpdateEffect = effect(() => {
    let timeRange = this.activeTimeRangeSelection();
    let refreshInterval = this.refreshInterval();
    if (timeRange) {
      this._urlParamService.updateUrlParams(timeRange, refreshInterval);
    }
  });

  refreshEffect = effect(() => {
    let range = this.timeRange();
    if (range) {
      this.refreshCharts(this._taskId, range);
    }
  });

  lastExecution?: Execution;
  summary?: ReportNodeSummary;
  executionsChartSettings?: TSChartSettings;
  keywordsChartSettings?: TSChartSettings;
  testCasesChartSettings?: TSChartSettings;
  emptyTestCasesResponse = false;
  protected readonly errorsDataSource = this._timeSeriesService.createErrorsDataSource();
  protected readonly availableErrorTypes = toSignal(
    this.errorsDataSource.allData$.pipe(
      map((items) => items.reduce((res, item) => [...res, ...item.types], [] as string[])),
      map((errorTypes) => Array.from(new Set(errorTypes)) as Status[]),
    ),
    { initialValue: [] },
  );

  lastKeywordsExecutions: Execution[] = [];

  constructor() {
    const urlParams = this._urlParamService.collectUrlParams();
    if (urlParams.refreshInterval !== undefined) {
      this.refreshInterval.set(urlParams.refreshInterval);
    } else {
      this.refreshInterval.set(5000);
    }
    if (urlParams.timeRange) {
      let urlTimeRange = urlParams.timeRange!;
      if (urlTimeRange.type === 'RELATIVE') {
        urlTimeRange = this.findRelativeTimeOption(urlTimeRange?.relativeSelection?.timeInMs);
      }
      this.activeTimeRangeSelection.set(urlTimeRange);
    } else {
      this.activeTimeRangeSelection.set(this.timeRangeOptions[1]);
    }
  }

  private findRelativeTimeOption(ms?: number): TimeRangePickerSelection {
    return this.timeRangeOptions.find((o) => o.relativeSelection?.timeInMs === ms) || this.timeRangeOptions[0];
  }

  private refreshCharts(taskId: string, fullRange: TimeRange) {
    if (!taskId) {
      return;
    }
    this.createPieChart(taskId, fullRange);
    this.createExecutionsChart(taskId, fullRange);
    this.fetchLastExecution(taskId);
    this.errorsDataSource.reload({ request: { taskId, timeRange: fullRange } });
    this.getLastExecutionsSorted(taskId, fullRange).subscribe((executions) => {
      this.fetchAndCreateKeywordsChart(fullRange, executions);
      this.fetchAndCreateTestCasesChart(fullRange, executions);
    });
  }

  handleMainChartZoom(timeRange: TimeRange) {
    timeRange = { from: Math.round(timeRange.from), to: Math.round(timeRange.to) };
    this.activeTimeRangeSelection.set({ type: 'ABSOLUTE', absoluteSelection: timeRange });
  }

  triggerRefresh() {
    // signal is triggered
    this.activeTimeRangeSelection.set({ ...this.activeTimeRangeSelection()! });
  }

  handleRefreshIntervalChange(interval: number) {
    this.refreshInterval.set(interval);
  }

  private calculateTimeRange(selection: TimeRangePickerSelection): TimeRange {
    switch (selection.type) {
      case 'ABSOLUTE':
        return { ...selection.absoluteSelection! };
      case 'RELATIVE':
        const relativeSelection = selection.relativeSelection!;
        const now = new Date().getTime();
        const from = now - relativeSelection!.timeInMs!;
        return { from: from, to: now };
      default:
        throw new Error('Unhandled type: ' + selection.type);
    }
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

  private getLastExecutionsSorted(taskId: string, timeRange: TimeRange): Observable<Execution[]> {
    return this._executionService
      .getLastExecutionsByTaskId(taskId, this.LAST_EXECUTIONS_TO_DISPLAY, timeRange.from, timeRange.to)
      .pipe(
        map((executions) => {
          executions.sort((a, b) => a.startTime! - b.startTime!);
          return executions;
        }),
      );
  }

  private fetchAndCreateKeywordsChart(timeRange: TimeRange, executions: Execution[]) {
    if (executions.length === 0) {
      this.keywordsChartSettings = this.createKeywordsChart([], []);
    } else {
      const executionsIdsJoined = executions.map((e) => `attributes.executionId = ${e.id!}`).join(' or ');
      const request: FetchBucketsRequest = {
        start: timeRange.from,
        end: timeRange.to,
        numberOfBuckets: 1,
        oqlFilter: executionsIdsJoined,
        groupDimensions: ['executionId', 'status'],
      };

      this._timeSeriesService.getReportNodesTimeSeries(request).subscribe((timeSeriesResponse) => {
        this.lastKeywordsExecutions = executions;
        const statusAttribute = 'status';
        let executionStats: Record<string, EntityWithKeywordsStats> = {};
        const allStatuses = new Set<string>();
        timeSeriesResponse.matrixKeys.forEach((attributes, i) => {
          const executionId = attributes['executionId'];
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
        this.keywordsChartSettings = this.createKeywordsChart(executions, series);
      });
    }
  }

  private createKeywordsChart(executions: Execution[], series: TSChartSeries[]): TSChartSettings {
    const axes: Axis[] = [
      {
        size: TimeSeriesConfig.CHART_LEGEND_SIZE,
        scale: 'y',
        values: (u, vals) => {
          return vals;
        },
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
      zoomEnabled: false,
    };
  }

  private fetchAndCreateTestCasesChart(timeRange: TimeRange, executions: Execution[]) {
    if (executions.length === 0) {
      this.testCasesChartSettings = this.createTestCasesChart([], []);
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

      this._timeSeriesService.getReportNodesTimeSeries(request).subscribe((timeSeriesResponse) => {
        this.lastKeywordsExecutions = executions;
        let statsByNodes: Record<string, EntityWithKeywordsStats> = {};
        const allStatuses = new Set<string>();
        if (timeSeriesResponse.matrixKeys.length === 0) {
          // don't display the chart when there are no test cases data
          this.emptyTestCasesResponse = true;
          return;
        }
        this.emptyTestCasesResponse = false;
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
        this.testCasesChartSettings = this.createTestCasesChart(executions, series);
      });
    }
  }

  private createTestCasesChart(executions: Execution[], series: TSChartSeries[]): TSChartSettings {
    const axes: Axis[] = [
      {
        size: TimeSeriesConfig.CHART_LEGEND_SIZE,
        scale: 'y',
        values: (u, vals) => {
          return vals;
        },
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
      zoomEnabled: false,
    };
  }

  private fetchLastExecution(taskId: string): void {
    this._executionService.getLastExecutionsByTaskId(taskId, 1, undefined, undefined).subscribe((executions) => {
      this.lastExecution = executions[0];
    });
  }

  private createExecutionsChart(taskId: string, timeRange: TimeRange) {
    const statusAttribute = 'result';
    const request: FetchBucketsRequest = {
      start: timeRange.from,
      end: timeRange.to,
      numberOfBuckets: 30,
      oqlFilter: `attributes.metricType = \"executions/duration\" and attributes.taskId = ${taskId}`,
      groupDimensions: [statusAttribute],
    };
    this._timeSeriesService.getTimeSeries(request).subscribe((response) => {
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
      this.executionsChartSettings = {
        title: '',
        showLegend: false,
        showDefaultLegend: true,
        xAxesSettings: {
          values: xLabels,
          valueFormatFn: (self, rawValue: number, seriesIdx) => new Date(rawValue).toLocaleDateString(),
        },
        cursor: {
          lock: true,
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
      };
    });
  }

  private calculateStackedValue(self: uPlot, currentValue: number, seriesIdx: number, idx: number): number {
    if (seriesIdx > 1) {
      const valueBelow = self.data[seriesIdx - 1][idx] || 0;
      return currentValue - valueBelow;
    }
    return currentValue;
  }

  private getDefaultBands(count: number): Band[] {
    const bands: Band[] = [];
    for (let i = count; i > 1; i--) {
      bands.push({ series: [i, i - 1] });
    }
    return bands;
  }

  jumpToExecution(eId: string) {
    window.open(`#/executions/${eId!}/viz`);
  }

  private createPieChart(taskId: string, timeRange: TimeRange) {
    const request: FetchBucketsRequest = {
      start: timeRange.from,
      end: timeRange.to,
      numberOfBuckets: 1,
      oqlFilter: `attributes.metricType = \"executions/duration\" and attributes.taskId = ${taskId}`,
      groupDimensions: ['result'],
    };
    this._timeSeriesService.getTimeSeries(request).subscribe((response) => {
      let total = 0;
      const pairs: { [key: string]: number } = {};
      response.matrixKeys.forEach((keyAttributes, i) => {
        let bucket: BucketResponse = response.matrix[i][0];
        pairs[keyAttributes['result'] as string] = bucket.count;
        total += bucket.count;
      });

      this.summary = {
        ...pairs,
        total: total,
      };
    });
  }

  handleTimeRangeChange(selection: TimeRangePickerSelection) {
    this.activeTimeRangeSelection.set(selection);
    // this.timeRangeChange.next({ selection, triggerRefresh: true });
  }
}
