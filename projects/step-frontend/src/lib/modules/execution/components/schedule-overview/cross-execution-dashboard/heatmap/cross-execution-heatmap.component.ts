import { Component, computed, inject, input, OnDestroy, OnInit, signal, ViewEncapsulation } from '@angular/core';
import {
  AugmentedExecutionsService,
  BucketResponse,
  DateFormat,
  DateRange,
  entitySelectionStateProvider,
  Execution,
  ExecutiontTaskParameters,
  FetchBucketsRequest,
  FilterConditionFactoryService,
  REQUEST_FILTERS_INTERCEPTORS,
  SearchValue,
  StepDataSource,
  Tab,
  tableColumnsConfigProvider,
  TableLocalDataSource,
  tablePersistenceConfigProvider,
  TimeSeriesService,
} from '@exense/step-core';
import { BehaviorSubject, map, Observable, of, switchMap, take } from 'rxjs';
import { ExecutionListFilterInterceptorService } from '../../../../services/execution-list-filter-interceptor.service';
import { FilterUtils, OQLBuilder, TimeSeriesEntityService } from '../../../../../timeseries/modules/_common';
import { EXECUTION_STATUS_TREE, Status } from '../../../../../_common/shared/status.enum';
import { CrossExecutionDashboardState } from '../cross-execution-dashboard-state';
import { ReportNodesChartType } from '../report/scheduler-report-view.component';
import { ReportNodeSummary } from '../../../../shared/report-node-summary';

interface HeatMapRow {
  label: string; // test case or keyword
  values: { color: string; link?: string }[];
}

interface ItemWithExecutionsStatuses {
  key: string;
  // execution - status - count
  statusesByExecutions: Record<string, Record<string, number>>;
}

export type HeatMapChartType = 'keywords' | 'testcases';

@Component({
  selector: 'step-cross-execution-heatmap',
  templateUrl: './cross-execution-heatmap.component.html',
  styleUrls: ['./cross-execution-heatmap.component.scss'],
  providers: [
    tableColumnsConfigProvider({
      entityTableRemoteId: AugmentedExecutionsService.EXECUTIONS_TABLE_ID,
      entityScreenId: 'executionParameters',
      entityScreenSubPath: 'executionParameters.customParameters',
    }),
    tablePersistenceConfigProvider('crossExecutionList', {
      storePagination: false,
      storeSort: false,
      storeSearch: false,
    }),
    ...entitySelectionStateProvider<string, ExecutiontTaskParameters>('id'),
    {
      provide: REQUEST_FILTERS_INTERCEPTORS,
      useClass: ExecutionListFilterInterceptorService,
      multi: true,
    },
    FilterConditionFactoryService,
  ],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class CrossExecutionHeatmapComponent implements OnInit, OnDestroy {
  private reloadRunningExecutionsCount$ = new BehaviorSubject<void>(undefined);
  readonly _state = inject(CrossExecutionDashboardState);
  readonly _filterConditionFactory = inject(FilterConditionFactoryService);
  readonly _augmentedExecutionsService = inject(AugmentedExecutionsService);
  private _timeSeriesEntityService = inject(TimeSeriesEntityService);
  readonly statusItemsTree$ = of(EXECUTION_STATUS_TREE);
  dataSource: StepDataSource<ItemWithExecutionsStatuses> | undefined;
  readonly DateFormat = DateFormat;
  private _timeSeriesService = inject(TimeSeriesService);

  hiddenFilters = input<Record<string, string | string[] | SearchValue>>();
  defaultDateRange = input<DateRange>();

  readonly tabs: Tab<ReportNodesChartType>[] = [
    {
      id: 'testcases',
      label: 'Test Cases',
    },
    {
      id: 'keywords',
      label: 'Keywords',
    },
  ];

  readonly heatmapType = signal<HeatMapChartType | undefined>(undefined);

  switchType(newType: HeatMapChartType) {
    this.heatmapType.set(newType);
  }

  readonly tableData$: Observable<ItemWithExecutionsStatuses[]> = this._state.lastExecutionsSorted$.pipe(
    switchMap((executions) =>
      this._state.timeRange$.pipe(
        take(1),
        switchMap((timeRange) => {
          const executionIdAttribute = 'eId';
          const statusAttribute = 'rnStatus';
          const nameAttribute = 'name'; // item key (e.g., keyword)

          // Build the executions filter (or a no-op if none)
          const execClause =
            executions.length > 0
              ? `(${executions.map((e) => `attributes.${executionIdAttribute} = "${e.id!}"`).join(' or ')})`
              : '(1 = 1)';

          // OQL: metric type + your executions
          const oql = new OQLBuilder()
            .open('and')
            .append('attributes.metricType = "response-time"')
            .append(execClause)
            .close()
            .build();

          const request: FetchBucketsRequest = {
            start: timeRange.from,
            end: timeRange.to,
            numberOfBuckets: 1, // single aggregate bucket over the time range
            oqlFilter: oql,
            // We need the item name, the execution id, and the status in the key-space
            groupDimensions: [nameAttribute, executionIdAttribute, statusAttribute],
          };

          return this._timeSeriesService.getTimeSeries(request).pipe(
            map((response) => {
              const allExecutionIds = executions.map((e) => String(e.id!));
              const allStatuses = new Set<string>();

              const itemsMap: Record<string, ItemWithExecutionsStatuses> = {};

              // Each row corresponds to one (name, eId, status) group
              response.matrixKeys.forEach((keyAttributes, i) => {
                const bucket: BucketResponse = response.matrix[i][0];
                const itemKey = String(keyAttributes[nameAttribute] ?? keyAttributes['key'] ?? '');
                const execId = String(keyAttributes[executionIdAttribute]);
                const status = String(keyAttributes[statusAttribute] ?? 'UNKNOWN');
                const count = bucket?.count ?? 0;

                allStatuses.add(status);

                const item =
                  itemsMap[itemKey] ??
                  (itemsMap[itemKey] = {
                    key: itemKey,
                    statusesByExecutions: {},
                  });

                const execMap = item.statusesByExecutions[execId] ?? (item.statusesByExecutions[execId] = {});

                execMap[status] = (execMap[status] ?? 0) + count;
              });

              const statusesArr = Array.from(allStatuses);
              Object.values(itemsMap).forEach((item) => {
                allExecutionIds.forEach((execId) => {
                  const execMap = item.statusesByExecutions[execId] ?? (item.statusesByExecutions[execId] = {});
                  statusesArr.forEach((st) => {
                    if (execMap[st] == null) execMap[st] = 0;
                  });
                });
              });
              return Object.values(itemsMap);
            }),
          );
        }),
      ),
    ),
  );

  ngOnInit(): void {
    this._state.testCasesChartSettings$.pipe(take(1)).subscribe(({ hasData }) => {
      this.heatmapType.set(hasData ? 'testcases' : 'keywords');
    });
    this.tableData$.subscribe((data) => {
      const heatmapData = data.map((item) => {
        return { item: item.key };
      });
      this.dataSource = new TableLocalDataSource(data);
    });
  }

  ngOnDestroy(): void {
    this.reloadRunningExecutionsCount$.complete();
    this._timeSeriesEntityService.clearCache();
  }

  refresh(): void {}
}
