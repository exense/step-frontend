import { Component, inject, input, OnDestroy, OnInit, signal } from '@angular/core';
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
  TimeSeriesService,
} from '@exense/step-core';
import { BehaviorSubject, combineLatest, distinctUntilChanged, filter, map, switchMap, take } from 'rxjs';
import { OQLBuilder, TimeSeriesEntityService } from '../../../../../timeseries/modules/_common';
import { CrossExecutionDashboardState } from '../cross-execution-dashboard-state';
import { HeatmapColorUtils } from './heatmap-color-utils';
import { toObservable } from '@angular/core/rxjs-interop';
import { HeatMapCell, HeatMapColor, HeatmapColumn, HeatmapData, HeatMapRow } from './types/heatmap-types';

interface ItemWithExecutionsStatuses {
  key: string; // keyword or testcase
  statusesByExecutions: Record<string, Record<string, number>>; // execution - status - count
}

export type HeatMapChartType = 'keywords' | 'testcases';

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

  readonly legendColors: HeatMapColor[] = [
    { hex: '#01a990', label: 'Passed' },
    { hex: '#ff595b', label: 'Failed' },
    { hex: '#000000', label: 'Technical Error' },
    { hex: COLORS.NORUN, label: 'Skipped/No run' },
    { hex: '#e1cc01', label: 'Interrupted' },
  ];

  STATUS_COLORS: Record<string, string> = {
    VETOED: '#000000',
    TECHNICAL_ERROR: '#000000',
    IMPORT_ERROR: '#000000',
    FAILED: '#ff595b',
    INTERRUPTED: '#e1cc01',
    PASSED: '#01a990',
    SKIPPED: '#a0a0a0',
    NORUN: '#a0a0a0',
    UNKNOWN: '#cccccc',
  };

  FALLBACK_COLOR = COLORS.NORUN;

  readonly heatmapType = signal<HeatMapChartType | undefined>(undefined);

  private readonly heatmapType$ = toObservable(this.heatmapType).pipe(
    filter((t): t is HeatMapChartType => !!t),
    distinctUntilChanged(),
  );

  switchType(newType: HeatMapChartType) {
    this.heatmapType.set(newType);
  }

  readonly heatMapData$ = combineLatest([
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

      const execClause =
        executions.length > 0
          ? `(${executions.map((e) => `attributes.${executionIdAttribute} = "${e.id!}"`).join(' or ')})`
          : '(1 = 1)';

      const oql = new OQLBuilder()
        .open('and')
        .append('attributes.metricType = "response-time"')
        .append(`attributes.type = "${attributesType}"`) // TODO add custom also?
        .append(execClause)
        .close()
        .build();

      const request: FetchBucketsRequest = {
        start: timeRange.from,
        end: timeRange.to,
        numberOfBuckets: 1,
        oqlFilter: oql,
        groupDimensions: [nameAttribute, executionIdAttribute, statusAttribute],
      };

      return this._timeSeriesService.getTimeSeries(request).pipe(
        map((response) => {
          const allExecutionIds = executions.map((e) => String(e.id!));
          const allStatuses = new Set<string>();
          const itemsMap: Record<string, ItemWithExecutionsStatuses> = {};

          response.matrixKeys.forEach((keyAttributes, i) => {
            const bucket: BucketResponse = response.matrix[i][0];
            const itemKey = String(keyAttributes[nameAttribute] ?? keyAttributes['key'] ?? '');
            const execId = String(keyAttributes[executionIdAttribute]);
            const status = String(keyAttributes[statusAttribute] ?? 'UNKNOWN');
            const count = bucket?.count ?? 0;

            allStatuses.add(status);

            let item = itemsMap[itemKey];
            if (item === null || item === undefined) {
              item = { key: itemKey, statusesByExecutions: {} };
              itemsMap[itemKey] = item;
            }

            let statusesCount = item.statusesByExecutions[execId];
            if (statusesCount === null || statusesCount === undefined) {
              statusesCount = {};
              item.statusesByExecutions[execId] = statusesCount;
            }

            statusesCount[status] = (statusesCount[status] ?? 0) + count;
          });

          const statusesArr = Array.from(allStatuses);
          Object.values(itemsMap).forEach((item) => {
            allExecutionIds.forEach((execId) => {
              let execMap = item.statusesByExecutions[execId];
              if (execMap === null || execMap === undefined) {
                execMap = {};
                item.statusesByExecutions[execId] = execMap;
              }

              statusesArr.forEach((st) => {
                if (execMap[st] === null || execMap[st] === undefined) {
                  execMap[st] = 0;
                }
              });
            });
          });

          return Object.values(itemsMap);
        }),
        map((items) => this.convertToTableData(executions, items)),
      );
    }),
  );

  convertToTableData(executions: Execution[], timeseriesItems: ItemWithExecutionsStatuses[]): HeatmapData {
    console.log(timeseriesItems);
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

        for (const exec of executions) {
          const execId = exec.id!;
          const statusCounts = item.statusesByExecutions?.[execId] || {};
          const statuses = Object.keys(statusCounts);
          let total = 0;
          for (const st of statuses) total += statusCounts[st] || 0;

          if (!total) {
            values[execId] = { color: this.FALLBACK_COLOR, timestamp: exec.startTime!, statusesCount: {} };
            continue;
          }

          let r = 0,
            g = 0,
            b = 0;
          for (const st of statuses) {
            const count = statusCounts[st] || 0;
            if (!count) continue;
            // @ts-ignore
            const colorHex = this.STATUS_COLORS[st] || this.STATUS_COLORS.UNKNOWN || this.FALLBACK_COLOR;
            const { r: cr, g: cg, b: cb } = HeatmapColorUtils.convertHexToRgb(colorHex);
            const w = count / total;
            r += cr * w;
            g += cg * w;
            b += cb * w;
          }
          values[execId] = {
            color: HeatmapColorUtils.rgbToHex(r, g, b),
            timestamp: exec.startTime!,
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
