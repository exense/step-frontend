import { filter, map, Observable, of, shareReplay, startWith, Subject, switchMap, take } from 'rxjs';
import { TimeRangePickerSelection } from '../../../../timeseries/modules/_common/types/time-selection/time-range-picker-selection';
import {
  AugmentedTimeSeriesService,
  BucketResponse,
  Execution,
  ExecutionsService,
  ExecutiontTaskParameters,
  FetchBucketsRequest,
  Plan,
  SearchValue,
  STATUS_COLORS,
  TableFetchLocalDataSource,
  TimeRange,
  TimeSeriesErrorEntry,
} from '@exense/step-core';
import { inject, signal, Signal, WritableSignal } from '@angular/core';
import { ReportNodeSummary } from '../../../shared/report-node-summary';
import { TSChartSeries, TSChartSettings } from '../../../../timeseries/modules/chart';
import {
  FilterBarItem,
  FilterUtils,
  OQLBuilder,
  TimeSeriesConfig,
  TimeSeriesUtils,
} from '../../../../timeseries/modules/_common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Status } from '../../../../_common/shared/status.enum';
import { Axis, Band } from 'uplot';
import PathBuilder = uPlot.Series.Points.PathBuilder;

declare const uPlot: any;
const uplotBarsFn: PathBuilder = uPlot.paths.bars({ size: [0.6, 100], align: 1 });

interface EntityWithKeywordsStats {
  entity: string;
  timestamp: number;
  statuses: Record<string, number>;
}

export type CrossExecutionViewType = 'task' | 'plan';

export abstract class CrossExecutionDashboardState {
  public LAST_EXECUTIONS_TO_DISPLAY = 30;

  protected _executionService = inject(ExecutionsService);
  protected _timeSeriesService = inject(AugmentedTimeSeriesService);
  protected _statusColors = inject(STATUS_COLORS);
  private readonly fetchLastExecutionTrigger$ = new Subject<void>();

  readonly task = signal<ExecutiontTaskParameters | undefined>(undefined);
  readonly plan = signal<Plan | undefined>(undefined);

  // view settings
  activeTimeRangeSelection = signal<TimeRangePickerSelection | undefined>(undefined);
  refreshInterval = signal<number>(0);

  abstract fetchLastExecution(): Observable<Execution>;
  abstract fetchLastExecutions(range: TimeRange): Observable<Execution[]>;
  abstract getDashboardFilter(): FilterBarItem;
  abstract readonly executionsTableFilter: Record<string, string | string[] | SearchValue>;
  abstract getViewType(): CrossExecutionViewType;

  updateTimeRangeSelection(selection: TimeRangePickerSelection) {
    this.activeTimeRangeSelection.set(selection);
  }

  updateRefreshInterval(interval: number): void {
    this.refreshInterval.set(interval);
  }

  timeRangeSelection$: Observable<TimeRangePickerSelection> = toObservable(this.activeTimeRangeSelection).pipe(
    filter((value): value is TimeRangePickerSelection => value != null),
  );

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

  readonly lastExecution$: Observable<{ execution: Execution | null }> = this.fetchLastExecutionTrigger$.pipe(
    startWith(undefined),
    switchMap(() => this.fetchLastExecution()),
    map((ex) => ({ execution: ex })),
    shareReplay(1),
  );

  // charts

  readonly summaryData$: Observable<ReportNodeSummary> = this.timeRange$.pipe(
    switchMap((timeRange) => {
      const oql = new OQLBuilder()
        .open('and')
        .append('attributes.metricType = "executions/duration"')
        .append(FilterUtils.filtersToOQL([this.getDashboardFilter()], 'attributes'))
        .build();
      const request: FetchBucketsRequest = {
        start: timeRange.from,
        end: timeRange.to,
        numberOfBuckets: 1,
        oqlFilter: oql,
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

  executionsChartSettings$ = this.timeRange$.pipe(
    switchMap((timeRange) => {
      const statusAttribute = 'result';
      const oql = new OQLBuilder()
        .open('and')
        .append('attributes.metricType = "executions/duration"')
        .append(FilterUtils.filtersToOQL([this.getDashboardFilter()], 'attributes'))
        .build();
      const request: FetchBucketsRequest = {
        start: timeRange.from,
        end: timeRange.to,
        numberOfBuckets: 30, // good amount of uplotBarsFn visually
        oqlFilter: oql,
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
              paths: uplotBarsFn,
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
              valueFormatFn: (self, rawValue: number, seriesIdx) => new Date(rawValue).toLocaleDateString(),
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
    switchMap((timeRange) => this.fetchLastExecutions(timeRange)),
    map((executions) => {
      executions.sort((a, b) => a.startTime! - b.startTime!);
      return executions;
    }),
    shareReplay(1),
  );

  keywordsChartSettings$ = this.lastExecutionsSorted$.pipe(
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
                    // width: 1,
                    value: (self: uPlot, rawValue: number, seriesIdx: number, idx: number) =>
                      this.calculateStackedValue(self, rawValue, seriesIdx, idx),
                    stroke: color,
                    fill: fill,
                    paths: uplotBarsFn,
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

  testCasesChartSettings$ = this.lastExecutionsSorted$.pipe(
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
                    paths: uplotBarsFn,
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
    let filterItem = this.getDashboardFilter();
    // this is working only with searchEntities for now. extend it if needed
    const filter = { [filterItem.attributeName]: filterItem.searchEntities[0]?.searchValue };
    this.errorsDataSource.reload({ request: { timeRange: timeRange, ...filter } });
  });

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
        // skip time series
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
      const value = currentValue - valueBelow;
      return value;
    }
    return currentValue;
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
}
