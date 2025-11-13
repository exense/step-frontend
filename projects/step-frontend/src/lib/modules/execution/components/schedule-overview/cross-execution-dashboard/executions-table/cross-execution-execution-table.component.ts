import { Component, computed, inject, input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import {
  AugmentedExecutionsService,
  DateFormat,
  DateRange,
  entitySelectionStateProvider,
  Execution,
  ExecutiontTaskParameters,
  FilterConditionFactoryService,
  REQUEST_FILTERS_INTERCEPTORS,
  SearchValue,
  StepDataSource,
  tableColumnsConfigProvider,
  TableIndicatorMode,
  tablePersistenceConfigProvider,
} from '@exense/step-core';
import { BehaviorSubject, of } from 'rxjs';
import { ExecutionListFilterInterceptorService } from '../../../../services/execution-list-filter-interceptor.service';
import { TimeSeriesEntityService } from '../../../../../timeseries/modules/_common';
import { EXECUTION_STATUS_TREE } from '../../../../../_common/shared/status.enum';
import { CrossExecutionDashboardState } from '../cross-execution-dashboard-state';

@Component({
  selector: 'step-cross-execution-executions-table',
  templateUrl: './cross-execution-execution-table.component.html',
  styleUrls: ['./cross-execution-execution-table.component.scss'],
  providers: [
    tableColumnsConfigProvider({
      entityTableRemoteId: 'crossExecutions',
      entityScreenId: 'executionParameters',
      entityScreenSubPath: 'executionParameters.customParameters',
    }),
    tablePersistenceConfigProvider('crossExecutionList', {
      storePagination: true,
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
export class CrossExecutionExecutionTableComponent implements OnInit, OnDestroy {
  private reloadRunningExecutionsCount$ = new BehaviorSubject<void>(undefined);
  readonly _state = inject(CrossExecutionDashboardState);
  readonly _filterConditionFactory = inject(FilterConditionFactoryService);
  readonly _augmentedExecutionsService = inject(AugmentedExecutionsService);
  private _timeSeriesEntityService = inject(TimeSeriesEntityService);
  readonly statusItemsTree$ = of(EXECUTION_STATUS_TREE);
  protected dataSource: StepDataSource<Execution> | undefined;
  readonly DateFormat = DateFormat;

  readonly hiddenFilters = input<Record<string, string | string[] | SearchValue>>();
  readonly defaultDateRange = input<DateRange>();

  protected tableFilters = computed(() => {
    const filters = this.hiddenFilters();
    const range = this.defaultDateRange();
    if (!range) {
      return undefined;
    }
    const combinedFilters: Record<string, SearchValue> = {
      startTime: this._filterConditionFactory.dateRangeFilterCondition(range),
      ...filters,
    };
    return combinedFilters;
  });

  ngOnInit(): void {
    this.dataSource = this._augmentedExecutionsService.getExecutionsTableDataSource();
  }

  ngOnDestroy(): void {
    this.reloadRunningExecutionsCount$.complete();
    this._timeSeriesEntityService.clearCache();
  }

  refreshTable(): void {
    this.dataSource!.reload({ hideProgress: true });
    this.reloadRunningExecutionsCount$.next();
  }

  protected readonly TableIndicatorMode = TableIndicatorMode;
}
