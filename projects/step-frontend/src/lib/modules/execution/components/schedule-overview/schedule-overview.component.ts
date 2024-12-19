import { Component, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import {
  AugmentedSchedulerService,
  BucketResponse,
  DateRange,
  DateUtilsService,
  Execution,
  ExecutionsService,
  ExecutiontTaskParameters,
  FetchBucketsRequest,
  MarkerType,
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
import PathBuilder = uPlot.Series.Points.PathBuilder;
import { DateTime } from 'luxon';
import { TSChartSeries, TSChartSettings } from '../../../timeseries/modules/chart';
import { Status } from '../../../_common/shared/status.enum';
import { TimeSeriesConfig, TimeSeriesUtils } from '../../../timeseries/modules/_common';
import { Axis, Band } from 'uplot';

declare const uPlot: any;

interface ExecutionWithKeywordsStats {
  executionId: string;
  timestamp: number;
  statuses: Record<string, number>;
}

interface TableErrorEntry {
  label: string;
  count: number;
  percentage: number;
  overallPercentage: number;
  type: string;
}

interface ErrorGroupingOption {
  label: string;
  attribute: string;
}

const EMPTY_TS_RESPONSE = {
  start: 0,
  interval: 0,
  end: 0,
  matrix: [],
  matrixKeys: [],
  truncated: false,
  collectionResolution: 0,
  higherResolutionUsed: false,
  ttlCovered: false,
};

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
  private _scheduleApi = inject(AugmentedSchedulerService);
  private _activatedRoute = inject(ActivatedRoute);
  private _timeSeriesService = inject(TimeSeriesService);
  private _executionService = inject(ExecutionsService);
  private _dateUtils = inject(DateUtilsService);
  private _fb = inject(FormBuilder);
  private _statusColors = inject(STATUS_COLORS);

  readonly RELATIVE_TIME_RANGES: TimeOption[] = [
    { label: 'Last Week', value: { isRelative: true, msFromNow: TimeUnit.DAY * 7 } },
    { label: 'Last 2 Weeks', value: { isRelative: true, msFromNow: TimeUnit.DAY * 14 } },
    { label: 'Last Month', value: { isRelative: true, msFromNow: TimeUnit.DAY * 30 } },
    { label: 'Last 6 Months', value: { isRelative: true, msFromNow: TimeUnit.DAY * 30 * 6 } },
  ];

  // generate bar builder with 60% bar (40% gap) & 100px max bar width
  private bars: PathBuilder = uPlot.paths.bars({ size: [0.6, 100] });

  private relativeTime?: number;
  now = DateTime.now();
  readonly dateRangeCtrl = this._fb.control<DateRange | null | undefined>({
    start: this.now.minus({ months: 1 }),
    end: this.now,
  });

  protected plan?: Partial<Plan>;
  protected error = '';
  protected repositoryId?: string;
  protected repositoryPlanId?: string;

  lastExecution?: Execution;
  selectedTask?: ExecutiontTaskParameters;
  summary?: ReportNodeSummary;
  executionsChartSettings?: TSChartSettings;
  keywordsChartSettings?: TSChartSettings;
  errorsDataSource?: TableDataSource<TableErrorEntry>;
  errorChartGroupingOptions: ErrorGroupingOption[] = [
    { label: 'Error Code', attribute: 'errorCode' },
    { label: 'Error Message', attribute: 'errorMessage' },
  ];
  errorChartSelectedGrouping: ErrorGroupingOption = this.errorChartGroupingOptions[0];

  readonly dateRange$ = this.dateRangeCtrl.valueChanges.pipe(
    startWith(this.dateRangeCtrl.value),
    map((range) => range ?? undefined),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  readonly timeRangeChange$: Observable<TimeRange> = this.dateRange$.pipe(
    map((dateRange) => this._dateUtils.dateRange2TimeRange(dateRange) as TimeRange),
    filter((v) => v !== undefined),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  readonly taskId$ = this._activatedRoute.params.pipe(
    map((params) => params?.['id'] as string),
    filter((id) => !!id),
  );

  ngOnInit(): void {
    const fetchTask$: Observable<ExecutiontTaskParameters> = this.taskId$.pipe(
      switchMap((taskId) => this._scheduleApi.getExecutionTaskById(taskId)),
    );
    let x = combineLatest([fetchTask$, this.timeRangeChange$]).subscribe(([task, fullRange]) => {
      this.selectedTask = task;
      this.createPieChart(task.id!, fullRange);
      this.createExecutionsChart(task.id!, fullRange);
      this.createKeywordsChart(task.id!, fullRange);
      this.createErrorsChart(task.id!, fullRange);
      this.fetchLastExecution(task.id!);
    });
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

  private createKeywordsChart(taskId: string, timeRange: TimeRange) {
    this._executionService
      .getLastExecutionsByTaskId(taskId, this.LAST_EXECUTIONS_TO_DISPLAY, timeRange.from, timeRange.to)
      .pipe(
        switchMap((executions) => {
          if (executions.length === 0) {
            return of({
              executions: [],
              timeSeriesResponse: EMPTY_TS_RESPONSE,
            });
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

          return this._timeSeriesService.getTimeSeries(request).pipe(
            map((tsResponse) => {
              return { executions: executions, timeSeriesResponse: tsResponse };
            }),
          );
        }),
      )
      .subscribe(({ executions, timeSeriesResponse }) => {
        const statusAttribute = 'rnStatus';
        let executionStats: Record<string, ExecutionWithKeywordsStats> = {};
        const allStatuses = new Set<string>();
        timeSeriesResponse.matrixKeys.forEach((attributes, i) => {
          const executionId = attributes['eId'];
          const status = attributes[statusAttribute];
          allStatuses.add(status);
          let executionEntry: ExecutionWithKeywordsStats = {
            executionId: executionId,
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
        executions.sort((a, b) => a.startTime! - b.startTime!);
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
              return vals.map((v: any) => v);
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
              return executions[idx].id!;
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
            enabled: false,
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
          enabled: false,
        },
        axes: axes,
        bands: this.getDefaultBands(series.length),
      };
    });
  }

  switchErrorGrouping(option: ErrorGroupingOption) {
    if (this.errorChartSelectedGrouping.attribute !== option.attribute) {
      this.errorChartSelectedGrouping = option;
      this.timeRangeChange$.pipe(take(1)).subscribe((dateRange) => {
        this.createErrorsChart(this.selectedTask!.id!, dateRange!);
      });
    }
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

  updateRange(timeRange?: DateRange): void {
    this.dateRangeCtrl.setValue(timeRange);
  }

  updateRelativeTime(time?: number): void {
    this.relativeTime = time;
    let now = DateTime.now();
    this.updateRange({ start: now.minus({ millisecond: time }), end: now });
  }

  private createErrorsChart(taskId: string, timeRange: TimeRange) {
    let groupingAttribute = this.errorChartSelectedGrouping.attribute;
    const request: FetchBucketsRequest = {
      start: timeRange.from,
      end: timeRange.to,
      numberOfBuckets: 1,
      oqlFilter: `attributes.taskId = ${taskId}`,
      groupDimensions: [groupingAttribute],
      collectAttributeKeys: ['status'],
      collectAttributesValuesLimit: 10,
    };
    this._timeSeriesService.getReportNodesTimeSeries(request).subscribe((response) => {
      let totalCount = 0;
      let countWithoutError = 0;
      const data: TableErrorEntry[] = response.matrixKeys
        .map((key, index) => {
          const error = key[groupingAttribute];
          const bucket = response.matrix[index][0];
          const bucketCount = bucket.count;
          totalCount += bucketCount;
          if (error === undefined) {
            countWithoutError += bucketCount;
            return undefined;
          } else {
            return {
              label: error,
              count: bucketCount,
              percentage: 0,
              overallPercentage: 0,
              type: ((bucket.attributes['status'] as string[]) || []).join(', '),
            } as TableErrorEntry;
          }
        })
        .filter((item) => !!item) as TableErrorEntry[];
      const totalWithErrors = totalCount - countWithoutError;
      // update the percentages
      data.forEach((entry) => {
        entry.percentage = Number(((entry.count / totalWithErrors) * 100).toFixed(2));
        entry.overallPercentage = Number(((entry.count / totalCount) * 100).toFixed(2));
      });
      this.errorsDataSource = new TableLocalDataSource(data);
    });
  }
}
