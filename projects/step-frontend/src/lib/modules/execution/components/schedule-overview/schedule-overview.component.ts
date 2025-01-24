import { Component, computed, effect, inject, OnInit, Signal, signal } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  AugmentedSchedulerService,
  BucketResponse,
  DateRange,
  DateUtilsService,
  Execution,
  ExecutionsService,
  ExecutiontTaskParameters,
  FetchBucketsRequest,
  Plan,
  TimeOption,
  STATUS_COLORS,
  TableDataSource,
  TableLocalDataSource,
  TimeRange,
  TimeSeriesService,
  TimeUnit,
} from '@exense/step-core';
import { combineLatest, filter, map, Observable, of, shareReplay, startWith, switchMap, take } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { ReportNodeSummary } from '../../shared/report-node-summary';
import { VIEW_MODE, ViewMode } from '../../shared/view-mode';
import { TSChartSeries, TSChartSettings } from '../../../timeseries/modules/chart';
import { Status } from '../../../_common/shared/status.enum';
import { TimeRangePickerSelection, TimeSeriesConfig, TimeSeriesUtils } from '../../../timeseries/modules/_common';
import { Axis, Band } from 'uplot';
import PathBuilder = uPlot.Series.Points.PathBuilder;
import { DateTime, Duration } from 'luxon';
import { TooltipContextData } from '../../../timeseries/modules/chart/injectables/tooltip-context-data';

declare const uPlot: any;

interface UrlParams {
  timeRangeSelection?: TimeRangePickerSelection;
}

interface EntityWithKeywordsStats {
  entity: string;
  timestamp: number;
  statuses: Record<string, number>;
}

interface TableErrorEntry {
  errorMessage: string;
  errorCode: string;
  count: number;
  percentage: number;
  executionIds: string[];
  executionIdsTruncated: boolean;
  types: string[]; // can be more when using same error code/message
}

@Component({
  selector: 'step-schedule-overview',
  templateUrl: './schedule-overview.component.html',
  styleUrls: ['./schedule-overview.component.scss'],
  providers: [
    {
      provide: VIEW_MODE,
      useFactory: () => {
        const _activatedRoute = inject(ActivatedRoute);
        return (_activatedRoute.snapshot.data['mode'] ?? ViewMode.VIEW) as ViewMode;
      },
    },
  ],
})
export class ScheduleOverviewComponent implements OnInit {
  readonly LAST_EXECUTIONS_TO_DISPLAY = 30;
  readonly URL_PARAMS_PREFIX = 'q_';
  private _scheduleApi = inject(AugmentedSchedulerService);
  private _activatedRoute = inject(ActivatedRoute);
  private _timeSeriesService = inject(TimeSeriesService);
  private _executionService = inject(ExecutionsService);
  protected _taskId = inject(ActivatedRoute).snapshot.params['id']! as string;
  private _statusColors = inject(STATUS_COLORS);
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

  task = signal<ExecutiontTaskParameters | undefined>(undefined);
  activeTimeRangeSelection = signal<TimeRangePickerSelection | undefined>(undefined);

  timeRange: Signal<TimeRange | undefined> = computed(() => {
    let selection = this.activeTimeRangeSelection();
    if (selection) {
      return this.calculateTimeRange(selection);
    } else {
      return undefined;
    }
  });

  lastExecution?: Execution;
  summary?: ReportNodeSummary;
  executionsChartSettings?: TSChartSettings;
  keywordsChartSettings?: TSChartSettings;
  testCasesChartSettings?: TSChartSettings;
  errorsDataSource?: TableDataSource<TableErrorEntry>;

  lastKeywordsExecutions: Execution[] = [];

  constructor() {
    const urlParams = this.collectUrlParams();
    if (urlParams.timeRangeSelection) {
      this.activeTimeRangeSelection.set(urlParams.timeRangeSelection!);
    } else {
      this.activeTimeRangeSelection.set(this.timeRangeOptions[1]);
    }
    effect(() => {
      let range = this.timeRange();
      if (range) {
        this.updateUrlParams();
        this.refreshCharts(this._taskId, range);
      }
    });
  }

  ngOnInit(): void {
    this._scheduleApi.getExecutionTaskById(this._taskId).subscribe((task) => {
      this.task.set(task);
    });
  }

  private findRelativeTimeOption(ms: number): TimeRangePickerSelection {
    return this.timeRangeOptions.find((o) => o.relativeSelection?.timeInMs === ms) || this.timeRangeOptions[0];
  }

  private refreshCharts(taskId: string, fullRange: TimeRange) {
    if (!taskId) {
      return;
    }
    console.log('refreshing charts');
    this.createPieChart(taskId, fullRange);
    this.createExecutionsChart(taskId, fullRange);
    this.fetchLastExecution(taskId);
    this.createErrorsChart(taskId, fullRange);
    this.getLastExecutionsSorted(taskId, fullRange).subscribe((executions) => {
      this.createKeywordsChart(fullRange, executions);
      this.createTestCasesChart(fullRange, executions);
    });
  }

  private calculateTimeRange(selection: TimeRangePickerSelection): TimeRange {
    switch (selection.type) {
      case 'ABSOLUTE':
        return selection.absoluteSelection!;
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

  private createKeywordsChart(timeRange: TimeRange, executions: Execution[]) {
    if (executions.length === 0) {
      return;
    }
    const executionsIdsJoined = executions.map((e) => `attributes.eId = ${e.id!}`).join(' or ');
    let oqlFilter = 'attributes.metricType = response-time and attributes.type = keyword';
    if (executionsIdsJoined) {
      oqlFilter += ` and (${executionsIdsJoined})`;
    }
    const request: FetchBucketsRequest = {
      start: timeRange.from,
      end: timeRange.to,
      numberOfBuckets: 1,
      oqlFilter: oqlFilter,
      groupDimensions: ['eId', 'rnStatus'],
    };

    return this._timeSeriesService.getTimeSeries(request).subscribe((timeSeriesResponse) => {
      this.lastKeywordsExecutions = executions;
      const statusAttribute = 'rnStatus';
      let executionStats: Record<string, EntityWithKeywordsStats> = {};
      const allStatuses = new Set<string>();
      timeSeriesResponse.matrixKeys.forEach((attributes, i) => {
        const executionId = attributes['eId'];
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
      let series = Array.from(allStatuses).map((status) => {
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
      const axes: Axis[] = [
        {
          size: TimeSeriesConfig.CHART_LEGEND_SIZE,
          scale: 'y',
          values: (u, vals) => {
            return vals;
          },
        },
      ];
      this.cumulateSeriesData(series);
      this.keywordsChartSettings = {
        title: `Keywords calls by execution (last ${this.LAST_EXECUTIONS_TO_DISPLAY})`,
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
      };
    });
  }

  private createTestCasesChart(timeRange: TimeRange, executions: Execution[]) {
    if (executions.length === 0) {
      return;
    }
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

    return this._timeSeriesService.getReportNodesTimeSeries(request).subscribe((timeSeriesResponse) => {
      this.lastKeywordsExecutions = executions;
      let statsByNodes: Record<string, EntityWithKeywordsStats> = {};
      const allStatuses = new Set<string>();
      if (timeSeriesResponse.matrixKeys.length === 0) {
        // don't display the chart when there are no test cases data
        return;
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
      console.log(series);
      const axes: Axis[] = [
        {
          size: TimeSeriesConfig.CHART_LEGEND_SIZE,
          scale: 'y',
          values: (u, vals) => {
            return vals;
          },
        },
      ];
      this.cumulateSeriesData(series);
      this.testCasesChartSettings = {
        title: `Test cases by execution (last ${this.LAST_EXECUTIONS_TO_DISPLAY})`,
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
      };
    });
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
        title: 'Executions statuses over time',
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

  private createErrorsChart(taskId: string, timeRange: TimeRange) {
    const executionsAttributesLimit = 10;
    const request: FetchBucketsRequest = {
      start: timeRange.from,
      end: timeRange.to,
      numberOfBuckets: 1,
      oqlFilter: `attributes.taskId = ${taskId}`,
      groupDimensions: ['errorMessage', 'errorCode'],
      collectAttributeKeys: ['status', 'executionId'],
      collectAttributesValuesLimit: executionsAttributesLimit,
    };
    this._timeSeriesService.getReportNodesTimeSeries(request).subscribe((response) => {
      let totalCountWithErrors = 0;
      const data: TableErrorEntry[] = response.matrixKeys
        .map((keyAttributes, index) => {
          const errorCode = keyAttributes['errorCode'];
          const errorMessage = keyAttributes['errorMessage'];
          const bucket = response.matrix[index][0];
          const bucketCount = bucket.count;

          if (errorCode === undefined && errorMessage === undefined) {
            return undefined;
          } else {
            totalCountWithErrors += bucketCount;
            return {
              errorCode: errorCode,
              errorMessage: errorMessage,
              count: bucketCount,
              percentage: 0,
              overallPercentage: 0,
              executionIds: bucket.attributes['executionId'] as string[],
              executionIdsTruncated: (bucket.attributes['executionId'] || []).length >= executionsAttributesLimit,
              types: (bucket.attributes['status'] as string[]) || [],
            } as TableErrorEntry;
          }
        })
        .filter((item) => !!item) as TableErrorEntry[];
      // update the percentages
      data.forEach((entry) => {
        entry.percentage = Number(((entry.count / totalCountWithErrors) * 100).toFixed(2));
      });
      this.errorsDataSource = new TableLocalDataSource(data, {});
    });
  }

  private updateUrlParams() {
    const timeRangeSelection = this.activeTimeRangeSelection()!;
    const params = TimeSeriesUtils.convertTimeRangeSelectionToUrlParams(timeRangeSelection);
    const prefixedParams = Object.keys(params).reduce((accumulator: any, key: string) => {
      accumulator[this.URL_PARAMS_PREFIX + key] = params[key];
      return accumulator;
    }, {});
    this._router.navigate([], {
      relativeTo: this._activatedRoute,
      queryParams: prefixedParams,
    });
  }

  private collectUrlParams(): UrlParams {
    let params = this._activatedRoute.snapshot.queryParams;
    params = Object.keys(params)
      .filter((key) => key.startsWith(this.URL_PARAMS_PREFIX))
      .reduce((acc, key) => {
        acc[key.substring(this.URL_PARAMS_PREFIX.length)] = params[key];
        return acc;
      }, {} as Params);
    let timeRangeSelection = TimeSeriesUtils.extractTimeRangeSelectionFromURLParams(params);
    if (timeRangeSelection?.type === 'RELATIVE') {
      timeRangeSelection = this.findRelativeTimeOption(timeRangeSelection.relativeSelection!.timeInMs!);
    }
    return {
      timeRangeSelection: timeRangeSelection,
    };
  }
}
