import { Component, computed, effect, inject, OnDestroy, viewChild, ViewEncapsulation } from '@angular/core';
import {
  AugmentedExecutionsService,
  BulkSelectionType,
  DateFormat,
  EntitySelectionState,
  entitySelectionStateProvider,
  ExecutiontTaskParameters,
  FilterConditionFactoryService,
  MultiLevelArrayFilterComponent,
  REQUEST_FILTERS_INTERCEPTORS,
  STORE_ALL,
  tableColumnsConfigProvider,
  tablePersistenceConfigProvider,
} from '@exense/step-core';
import { ERROR_STATUSES, EXECUTION_STATUS_TREE, Status } from '../../../_common/step-common.module';
import { BehaviorSubject, exhaustMap, of, startWith, switchMap } from 'rxjs';
import { ExecutionListFilterInterceptorService } from '../../services/execution-list-filter-interceptor.service';
import { TimeSeriesEntityService } from '../../../timeseries/modules/_common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';

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
export class ExecutionListComponent implements OnDestroy {
  private reloadRunningExecutionsCount$ = new BehaviorSubject<void>(undefined);
  readonly _filterConditionFactory = inject(FilterConditionFactoryService);
  readonly _augmentedExecutionsService = inject(AugmentedExecutionsService);
  private _timeSeriesEntityService = inject(TimeSeriesEntityService);
  private _selectionState = inject<EntitySelectionState<string, ExecutiontTaskParameters>>(EntitySelectionState);
  readonly dataSource = this._augmentedExecutionsService.getExecutionsTableDataSource();
  readonly DateFormat = DateFormat;
  readonly statusItemsTree$ = of(EXECUTION_STATUS_TREE);
  readonly runningExecutionsCount$ = this.reloadRunningExecutionsCount$.pipe(
    exhaustMap(() => this._augmentedExecutionsService.countExecutionsByStatus(Status.RUNNING)),
  );

  autoRefreshDisabled: boolean = false;

  private effectSelectionTypeChanged = effect(() => {
    const selectionType = this._selectionState.selectionType();
    this.autoRefreshDisabled = selectionType !== BulkSelectionType.NONE;

    if (this.autoRefreshDisabled) {
      this.dataSource.skipOngoingRequest();
    }
  });

  private errorStatusesSet = new Set(ERROR_STATUSES);
  private statusFilter = viewChild('statusFilter', { read: MultiLevelArrayFilterComponent });
  private statusFilter$ = toObservable(this.statusFilter);
  private statusFilterValue$ = this.statusFilter$.pipe(
    switchMap((statusFilter) => {
      if (!statusFilter) {
        return of([] as Status[]);
      }
      const ctrl = statusFilter.filterControl as FormControl<Status[]>;
      return ctrl.valueChanges.pipe(startWith(ctrl.value));
    }),
  );
  private statusFilterValue = toSignal(this.statusFilterValue$, { initialValue: [] });

  protected readonly isErrorFilterApplied = computed(() => {
    const statusFilterValue = this.statusFilterValue();
    return (
      statusFilterValue.length === this.errorStatusesSet.size &&
      statusFilterValue.every((status) => this.errorStatusesSet.has(status))
    );
  });

  ngOnDestroy(): void {
    this.reloadRunningExecutionsCount$.complete();
    this._timeSeriesEntityService.clearCache();
  }

  refreshTable(): void {
    this.dataSource.reload({ hideProgress: true, isForce: false });
    this.reloadRunningExecutionsCount$.next();
  }

  handleRunningStatusClick(): void {
    this.statusFilter()?.filterControl?.setValue?.([Status.RUNNING]);
  }

  protected toggleErrorFilter(): void {
    if (this.isErrorFilterApplied()) {
      this.statusFilter()?.filterControl?.setValue?.([]);
      return;
    }
    this.statusFilter()?.filterControl?.setValue?.([...ERROR_STATUSES]);
  }
}
