import { Component, effect, inject, input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
  ArrayFilterComponent,
  AugmentedExecutionsService,
  AutoDeselectStrategy,
  BulkSelectionType,
  DateFormat,
  DateRange,
  Execution,
  ExecutiontTaskParameters,
  FilterConditionFactoryService,
  RangeFilterComponent,
  REQUEST_FILTERS_INTERCEPTORS,
  SearchValue,
  selectionCollectionProvider,
  StepDataSource,
  STORE_ALL,
  tableColumnsConfigProvider,
  tablePersistenceConfigProvider,
} from '@exense/step-core';
import { EXECUTION_STATUS_TREE, Status } from '../../../_common/step-common.module';
import { BehaviorSubject, of, switchMap } from 'rxjs';
import { ExecutionListFilterInterceptorService } from '../../services/execution-list-filter-interceptor.service';
import { TimeSeriesEntityService } from '../../../timeseries/modules/_common';
import { DateTime } from 'luxon';

@Component({
  selector: 'step-execution-list',
  templateUrl: './execution-list.component.html',
  styleUrls: ['./execution-list.component.scss'],
  providers: [
    tableColumnsConfigProvider({
      entityTableRemoteId: AugmentedExecutionsService.EXECUTIONS_TABLE_ID,
      entityScreenId: 'executionParameters',
      entityScreenSubPath: 'executionParameters.customParameters',
    }),
    tablePersistenceConfigProvider('executionList', STORE_ALL),
    ...selectionCollectionProvider<string, ExecutiontTaskParameters>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER),
    {
      provide: REQUEST_FILTERS_INTERCEPTORS,
      useClass: ExecutionListFilterInterceptorService,
      multi: true,
    },
    FilterConditionFactoryService,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class ExecutionListComponent implements OnInit, OnDestroy {
  private reloadRunningExecutionsCount$ = new BehaviorSubject<void>(undefined);
  readonly _filterConditionFactory = inject(FilterConditionFactoryService);
  readonly _augmentedExecutionsService = inject(AugmentedExecutionsService);
  private _timeSeriesEntityService = inject(TimeSeriesEntityService);
  dataSource: StepDataSource<Execution> | undefined;
  readonly DateFormat = DateFormat;
  readonly statusItemsTree$ = of(EXECUTION_STATUS_TREE);
  readonly runningExecutionsCount$ = this.reloadRunningExecutionsCount$.pipe(
    switchMap(() => this._augmentedExecutionsService.countExecutionsByStatus(Status.RUNNING)),
  );

  autoRefresh = input<boolean>(true);
  hiddenFilters = input<Record<string, string | string[] | SearchValue>>();
  defaultDateRange = input<DateRange>();

  autoRefreshInputEffect = effect(() => {
    const enabled = this.autoRefresh();
    this.autoRefreshDisabledState = !enabled;
  });

  customFn = () => {
    return this._filterConditionFactory.dateRangeFilterCondition({ start: undefined, end: DateTime.now() });
  };

  autoRefreshDisabledState: boolean = false;

  @ViewChild('statusFilter')
  private statusFilter?: ArrayFilterComponent;

  @ViewChild('executionTimeFilter')
  executionTimeFilter?: RangeFilterComponent;

  ngOnInit(): void {
    this.dataSource = this._augmentedExecutionsService.getExecutionsTableDataSource(this.hiddenFilters());
  }

  ngOnDestroy(): void {
    this.reloadRunningExecutionsCount$.complete();
    this._timeSeriesEntityService.clearCache();
  }

  changeType(selectionType: BulkSelectionType): void {
    if (this.autoRefresh()) {
      this.autoRefreshDisabledState = selectionType !== BulkSelectionType.NONE;
      if (this.autoRefreshDisabledState) {
        this.dataSource!.skipOngoingRequest();
      }
    }
  }

  refreshTable(): void {
    this.dataSource!.reload({ hideProgress: true });
    this.reloadRunningExecutionsCount$.next();
  }

  handleRunningStatusClick(): void {
    this.statusFilter?.filterControl.setValue([Status.RUNNING]);
  }
}
