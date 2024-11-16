import { Component, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import {
  AugmentedSchedulerService,
  BucketResponse,
  DateRange,
  DateUtilsService,
  ExecutiontTaskParameters,
  FetchBucketsRequest,
  MarkerType,
  Plan,
  STATUS_COLORS,
  TimeRange,
  TimeSeriesService,
} from '@exense/step-core';
import { filter, forkJoin, map, Observable, shareReplay, startWith, switchMap } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { ReportNodeSummary } from '../../shared/report-node-summary';
import { VIEW_MODE, ViewMode } from '../../shared/view-mode';
import { DateTime } from 'luxon';
import { TSChartSeries, TSChartSettings } from '../../../timeseries/modules/chart';
import { SeriesStroke } from '../../../timeseries/modules/_common/types/time-series/series-stroke';
import { TimeSeriesConfig, TimeSeriesUtils } from '../../../timeseries/modules/_common';
import { Axis, Band } from 'uplot';
import { Status } from '../../../_common/shared/status.enum';
import PathBuilder = uPlot.Series.Points.PathBuilder;
import { UPlotStackedUtils } from '../../../timeseries/modules/_common/UPlotStackedUtils';

declare const uPlot: any;

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
  private _scheduleApi = inject(AugmentedSchedulerService);
  private _activatedRoute = inject(ActivatedRoute);
  private _timeSeriesService = inject(TimeSeriesService);
  private _dateUtils = inject(DateUtilsService);
  private _fb = inject(FormBuilder);
  private _statusColors = inject(STATUS_COLORS);

  // generate bar builder with 60% bar (40% gap) & 100px max bar width
  private bars: PathBuilder = uPlot.paths.bars({ size: [0.6, 100] });

  private relativeTime?: number;

  readonly dateRangeCtrl = this._fb.control<DateRange | null | undefined>(null);

  protected plan?: Partial<Plan>;
  protected error = '';
  protected repositoryId?: string;
  protected repositoryPlanId?: string;

  selectedTask?: ExecutiontTaskParameters;
  summary?: ReportNodeSummary;
  chartSettings?: TSChartSettings;

  readonly dateRange$ = this.dateRangeCtrl.valueChanges.pipe(
    startWith(this.dateRangeCtrl.value),
    map((range) => range ?? undefined),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  readonly timeRange$ = this.dateRange$.pipe(
    map((dateRange) => this._dateUtils.dateRange2TimeRange(dateRange)),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  readonly taskId$ = this._activatedRoute.params.pipe(
    map((params) => params?.['id'] as string),
    filter((id) => !!id),
  );

  private updateTask(task: ExecutiontTaskParameters): ExecutiontTaskParameters {
    task.attributes = task.attributes || {};
    task.executionsParameters = task.executionsParameters || {};
    task.executionsParameters.customParameters = task.executionsParameters.customParameters || {};

    const repository = task.executionsParameters.repositoryObject;

    if (repository?.repositoryID === 'local') {
      const planId = repository.repositoryParameters?.['planid'];
      if (planId) {
        const name = task.executionsParameters.description ?? '';
        this.plan = {
          id: planId,
          attributes: { name },
        };
      }
    } else {
      this.repositoryId = repository?.repositoryID;
      this.repositoryPlanId =
        repository?.repositoryParameters?.['planid'] ?? repository?.repositoryParameters?.['planId'];
    }
    return task;
  }

  private getFullTimeRange(taskId: string): Observable<TimeRange> {
    return this._scheduleApi.getExecutionsByTaskId(taskId, 0, new Date().getTime()).pipe(
      map((executions) => {
        let now = new Date().getTime();
        let start = 0;
        if (executions.data.length) {
          start = executions.data[0].startTime;
        } else {
          start = now - 1000 * 60;
        }
        return { from: start - 1000 * 60 * 60 * 24 * 7, to: now };
      }),
    );
  }

  ngOnInit(): void {
    this.taskId$
      .pipe(
        switchMap((taskId) => {
          return forkJoin([this._scheduleApi.getExecutionTaskById(taskId), this.getFullTimeRange(taskId)]);
        }),
      )
      .subscribe(([task, fullRange]) => {
        this.selectedTask = this.updateTask(task);
        this.dateRangeCtrl.setValue({
          start: DateTime.fromMillis(fullRange.from),
          end: DateTime.fromMillis(fullRange.to),
        });
        this.createPieChart(task.id!, fullRange);
        this.createChart(task.id!, fullRange);
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

  private createChart(taskId: string, timeRange: TimeRange) {
    const statusAttribute = 'result';
    const request: FetchBucketsRequest = {
      start: timeRange.from,
      end: timeRange.to,
      intervalSize: 1000 * 60 * 60 * 24, // one day
      oqlFilter: `attributes.metricType = \"executions/duration\" and attributes.taskId = ${taskId}`,
      groupDimensions: [statusAttribute],
    };
    this._timeSeriesService.getTimeSeries(request).subscribe((response) => {
      console.log(response);
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
      this.chartSettings = {
        title: 'Executions in time',
        showLegend: false,
        xValues: xLabels,
        series: series,
        tooltipOptions: {
          enabled: false,
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
    console.log(bands);
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
      console.log(response);
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

  updateRange(timeRange?: TimeRange | null): void {
    this.dateRangeCtrl.setValue(this._dateUtils.timeRange2DateRange(timeRange));
  }

  updateRelativeTime(time?: number): void {
    this.relativeTime = time;
  }
}
