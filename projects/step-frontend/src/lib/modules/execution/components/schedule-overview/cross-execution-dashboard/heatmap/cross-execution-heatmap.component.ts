import { Component, computed, inject, input, OnDestroy, OnInit, signal } from '@angular/core';
import {
  BucketResponse,
  COLORS,
  DateFormat,
  DateRange,
  Execution,
  FetchBucketsRequest,
  FilterConditionFactoryService,
  SearchValue,
  Tab,
  TimeSeriesAPIResponse,
  TimeSeriesService,
} from '@exense/step-core';
import { BehaviorSubject, combineLatest, distinctUntilChanged, filter, map, Observable, switchMap, take } from 'rxjs';
import { OQLBuilder, TimeSeriesEntityService } from '../../../../../timeseries/modules/_common';
import { CrossExecutionDashboardState } from '../cross-execution-dashboard-state';
import { HeatmapColorUtils, RGB } from './heatmap-color-utils';
import { toObservable } from '@angular/core/rxjs-interop';
import {
  HeatMapCell,
  HeatMapColor,
  HeatmapColumn,
  HeatmapData,
  HeatmapDataResponse,
  HeatMapRow,
} from './types/heatmap-types';

interface ItemWithExecutionsStatuses {
  key: string; // keyword or testcase
  statusesByExecutions: Record<string, Record<string, number>>; // execution - status - count
}

export type HeatMapChartType = 'keywords' | 'testcases';

type HeatmapStatus =
  | 'VETOED'
  | 'TECHNICAL_ERROR'
  | 'IMPORT_ERROR'
  | 'FAILED'
  | 'INTERRUPTED'
  | 'PASSED'
  | 'SKIPPED'
  | 'NORUN'
  | 'UNKNOWN';

const HEATMAP_MAX_SERIES_COUNT = 10000;

@Component({
  selector: 'step-cross-execution-heatmap',
  templateUrl: './cross-execution-heatmap.component.html',
  styleUrls: ['./cross-execution-heatmap.component.scss'],
  providers: [],
  standalone: false,
})
export class CrossExecutionHeatmapComponent implements OnInit, OnDestroy {
  private reloadRunningExecutionsCount$ = new BehaviorSubject<void>(undefined);
  readonly _state = inject(CrossExecutionDashboardState);
  readonly _filterConditionFactory = inject(FilterConditionFactoryService);
  private _timeSeriesEntityService = inject(TimeSeriesEntityService);
  readonly DateFormat = DateFormat;
  private _timeSeriesService = inject(TimeSeriesService);

  hiddenFilters = input<Record<string, string | string[] | SearchValue>>();
  defaultDateRange = input<DateRange>();

  dashletTitle = computed(() => {
    let heatmapType = this.heatmapType();
    const lastExecutionLabel = ` (last ${this._state.LAST_EXECUTIONS_TO_DISPLAY} executions)`;
    return (heatmapType === 'keywords' ? 'Keyword statuses' : 'Test cases statuses') + lastExecutionLabel;
  });

  readonly tabs: Tab<'testcases' | 'keywords'>[] = [
    {
      id: 'testcases',
      label: 'Test Cases',
    },
    {
      id: 'keywords',
      label: 'Keywords',
    },
  ];

  readonly HEATMAP_STATUS_COLORS: Record<HeatmapStatus, string> = {
    VETOED: COLORS.TECHNICAL_ERROR,
    TECHNICAL_ERROR: COLORS.TECHNICAL_ERROR,
    IMPORT_ERROR: COLORS.TECHNICAL_ERROR,
    FAILED: COLORS.FAILED,
    INTERRUPTED: COLORS.INTERRUPTED,
    PASSED: COLORS.PASSED,
    SKIPPED: COLORS.SKIPPED,
    NORUN: COLORS.NORUN,
    UNKNOWN: COLORS.UNKNOW,
  };

  readonly legendColors: HeatMapColor[] = [
    { hex: this.HEATMAP_STATUS_COLORS.PASSED, label: 'Passed' },
    { hex: this.HEATMAP_STATUS_COLORS.FAILED, label: 'Failed' },
    { hex: this.HEATMAP_STATUS_COLORS.TECHNICAL_ERROR, label: 'Technical Error' },
    { hex: this.HEATMAP_STATUS_COLORS.NORUN, label: 'Skipped/No run' },
    { hex: this.HEATMAP_STATUS_COLORS.INTERRUPTED, label: 'Interrupted' },
  ];

  FALLBACK_COLOR = COLORS.NORUN;

  readonly heatmapType = signal<HeatMapChartType | undefined>(undefined);

  private readonly heatmapType$ = toObservable(this.heatmapType).pipe(
    filter((t): t is HeatMapChartType => !!t),
    distinctUntilChanged(),
  );

  protected switchType(newType: HeatMapChartType) {
    this.heatmapType.set(newType);
  }

  readonly heatMapData$: Observable<HeatmapDataResponse> = combineLatest([
    this._state.lastExecutionsSorted$,
    this._state.timeRange$,
    this.heatmapType$,
  ]).pipe(
    switchMap(([executions, timeRange, heatmapType]) => {
      const isKeywordsHeatmap = heatmapType === 'keywords';

      const executionIdAttribute = 'eId';
      const statusAttribute = 'rnStatus';
      const attributesType = isKeywordsHeatmap ? 'keyword' : 'testcase';
      const nameAttribute = 'name';

      const executionsClause =
        executions.length > 0
          ? `(${executions.map((e) => `attributes.${executionIdAttribute} = "${e.id!}"`).join(' or ')})`
          : '(1 = 1)';

      const oql = new OQLBuilder()
        .open('and')
        .append('attributes.metricType = "response-time"')
        .append(`attributes.type = "${attributesType}"`)
        .append(executionsClause)
        .close()
        .build();

      const request: FetchBucketsRequest = {
        start: timeRange.from,
        end: timeRange.to,
        numberOfBuckets: 1,
        oqlFilter: oql,
        groupDimensions: [nameAttribute, executionIdAttribute, statusAttribute],
        maxNumberOfSeries: HEATMAP_MAX_SERIES_COUNT,
      };

      return this._timeSeriesService.getTimeSeries(request).pipe(
        map((response: TimeSeriesAPIResponse) => {
          const allExecutionIds = executions.map((e) => String(e.id!));
          const allStatuses = new Set<string>();
          const itemsMap: Record<string, ItemWithExecutionsStatuses> = {};

          response.matrixKeys.forEach((keyAttributes, i) => {
            const bucket: BucketResponse = response.matrix[i][0];
            const itemKey = String(keyAttributes[nameAttribute] ?? keyAttributes['key'] ?? '');
            const executionId = String(keyAttributes[executionIdAttribute]);
            const status = String(keyAttributes[statusAttribute] ?? 'UNKNOWN');
            const count = bucket?.count ?? 0;

            allStatuses.add(status);

            let item = itemsMap[itemKey];
            if (item === null || item === undefined) {
              item = { key: itemKey, statusesByExecutions: {} };
              itemsMap[itemKey] = item;
            }

            let statusesCount = item.statusesByExecutions[executionId];
            if (statusesCount === null || statusesCount === undefined) {
              statusesCount = {};
              item.statusesByExecutions[executionId] = statusesCount;
            }

            statusesCount[status] = (statusesCount[status] ?? 0) + count;
          });

          const statusArr = Array.from(allStatuses);
          Object.values(itemsMap).forEach((item) => {
            allExecutionIds.forEach((execId) => {
              let executionMap = item.statusesByExecutions[execId];
              if (executionMap === null || executionMap === undefined) {
                executionMap = {};
                item.statusesByExecutions[execId] = executionMap;
              }

              statusArr.forEach((st) => {
                if (executionMap[st] === null || executionMap[st] === undefined) {
                  executionMap[st] = 0;
                }
              });
            });
          });

          return { data: this.convertToTableData(executions, Object.values(itemsMap)), truncated: false };
        }),
      );
    }),
  );

  convertToTableData(executions: Execution[], timeseriesItems: ItemWithExecutionsStatuses[]): HeatmapData {
    const executionsByIds: Record<string, Execution> = {};
    const columns: HeatmapColumn[] = [];
    executions.forEach((e) => {
      executionsByIds[e.id!] = e;
      columns.push({ id: e.id!, label: this.formatExecutionHeader(e.startTime!) });
    });

    const rows: HeatMapRow[] = timeseriesItems
      .sort((a, b) => a.key.localeCompare(b.key))
      .map<HeatMapRow>((item) => {
        const values: Record<string, HeatMapCell> = {};

        for (const execution of executions) {
          const executionId = execution.id!;
          const statusCounts = item.statusesByExecutions?.[executionId] || {};
          const statuses = Object.keys(statusCounts);
          let total = 0;
          for (const st of statuses) total += statusCounts[st] || 0;

          if (!total) {
            values[executionId] = { color: this.FALLBACK_COLOR, timestamp: execution.startTime!, statusesCount: {} };
            continue;
          }

          let combinedColor: RGB = { r: 0, g: 0, b: 0 };
          for (const st of statuses) {
            const count = statusCounts[st] || 0;
            if (!count) continue;
            const statusHex =
              this.HEATMAP_STATUS_COLORS[st as HeatmapStatus] ||
              this.HEATMAP_STATUS_COLORS['UNKNOWN'] ||
              this.FALLBACK_COLOR;
            const statusRgb = HeatmapColorUtils.hexToRgb(statusHex);
            combinedColor = HeatmapColorUtils.addColor(combinedColor, statusRgb, count / total);
          }
          values[executionId] = {
            color: HeatmapColorUtils.rgbToHex(combinedColor),
            timestamp: execution.startTime!,
            statusesCount: statusCounts,
          };
        }

        return { label: item.key, cells: values };
      });
    return {
      columns: columns,
      rows: rows,
    };
  }

  ngOnInit(): void {
    this._state.testCasesChartSettings$.pipe(take(1)).subscribe(({ hasData }) => {
      this.heatmapType.set(hasData ? 'testcases' : 'keywords');
    });
  }

  formatExecutionHeader(ms: number) {
    const d = new Date(ms);
    const pad = (n: any) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  ngOnDestroy(): void {
    this.reloadRunningExecutionsCount$.complete();
    this._timeSeriesEntityService.clearCache();
  }

  refresh(): void {}
}
