import { Component, computed, effect, inject, OnDestroy, signal, viewChild, ViewEncapsulation } from '@angular/core';
import {
  AugmentedExecutionsService,
  AuthService,
  BulkSelectionType,
  DateFormat,
  DialogsService,
  EntitySelectionState,
  entitySelectionStateProvider,
  Execution,
  ExecutionListFiltersService,
  ExecutiontTaskParameters,
  FilterConditionFactoryService,
  MultiLevelArrayFilterComponent,
  REQUEST_FILTERS_INTERCEPTORS,
  STORE_ALL,
  tableColumnsConfigProvider,
  tablePersistenceConfigProvider,
} from '@exense/step-core';
import { ERROR_STATUSES, EXECUTION_STATUS_TREE, Status } from '../../../_common/step-common.module';
import { BehaviorSubject, EMPTY, exhaustMap, filter, map, of, startWith, switchMap } from 'rxjs';
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
  protected readonly _filterConditionFactory = inject(FilterConditionFactoryService);
  private _executionListFilters = inject(ExecutionListFiltersService);
  protected readonly _augmentedExecutionsService = inject(AugmentedExecutionsService);
  private _timeSeriesEntityService = inject(TimeSeriesEntityService);
  private _selectionState = inject<EntitySelectionState<string, ExecutiontTaskParameters>>(EntitySelectionState);
  protected readonly dataSource = this._augmentedExecutionsService.getExecutionsTableDataSource();
  protected readonly staticFilters = {
    aiGenerations: this._filterConditionFactory.basicFilterCondition(this._executionListFilters.getFilters()),
  };
  protected readonly DateFormat = DateFormat;
  protected readonly statusItemsTree$ = of(EXECUTION_STATUS_TREE);
  protected readonly runningExecutionsCount$ = this.reloadRunningExecutionsCount$.pipe(
    exhaustMap(() => this._augmentedExecutionsService.countExecutionsByStatus(Status.RUNNING)),
  );
  private readonly _dialogs = inject(DialogsService);
  private readonly _auth = inject(AuthService);

  protected autoRefreshDisabled: boolean = false;

  private effectSelectionTypeChanged = effect(() => {
    const selectionType = this._selectionState.selectionType();
    this.autoRefreshDisabled = selectionType !== BulkSelectionType.NONE;

    if (this.autoRefreshDisabled) {
      this.dataSource.skipOngoingRequest();
    }
  });

  private errorStatusesSet = new Set(ERROR_STATUSES);
  private readonly statusFilter = viewChild('statusFilter', { read: MultiLevelArrayFilterComponent });
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
  private readonly statusFilterValue = toSignal(this.statusFilterValue$, { initialValue: [] });

  protected readonly isErrorFilterApplied = computed(() => {
    const statusFilterValue = this.statusFilterValue() ?? [];
    return (
      statusFilterValue.length === this.errorStatusesSet.size &&
      statusFilterValue.every((status) => this.errorStatusesSet.has(status))
    );
  });

  protected readonly calculateCounts = signal(false);

  protected restartExecution(execution: Execution): void {
    const name = execution.description;
    const parameters$ = execution.executionParameters
      ? of(execution.executionParameters)
      : this._augmentedExecutionsService
          .getExecutionById(execution.id!)
          .pipe(map((value) => value.executionParameters));
    this._dialogs
      .showWarning(`Are you sure you want to restart Execution ${name}?`)
      .pipe(
        filter((confirmed) => !!confirmed),
        switchMap(() => parameters$),
        switchMap((parameters) => {
          if (!parameters) {
            return this._dialogs
              .showErrorMsg('The execution has no parameters to re-execute.')
              .pipe(switchMap(() => EMPTY));
          }
          return this._augmentedExecutionsService.execute({ ...parameters, userID: this._auth.getUserID() });
        }),
      )
      .subscribe(() => this.refreshTable());
  }

  protected stopExecution(execution: Execution): void {
    const name = execution.description;
    this._dialogs
      .showWarning(`Are you sure you want to stop Execution ${name}?`)
      .pipe(
        filter((confirmed) => !!confirmed),
        switchMap(() => this._augmentedExecutionsService.abort(execution.id!)),
      )
      .subscribe(() => this.refreshTable());
  }

  ngOnDestroy(): void {
    this.reloadRunningExecutionsCount$.complete();
    this._timeSeriesEntityService.clearCache();
  }

  protected refreshTable(): void {
    this.dataSource.reload({ hideProgress: true, isForce: false });
    this.reloadRunningExecutionsCount$.next();
  }

  protected handleRunningStatusClick(): void {
    this.statusFilter()?.filterControl?.setValue?.([Status.RUNNING]);
  }

  protected toggleErrorFilter(): void {
    if (this.isErrorFilterApplied()) {
      this.statusFilter()?.filterControl?.setValue?.([]);
      return;
    }
    this.statusFilter()?.filterControl?.setValue?.([...ERROR_STATUSES]);
  }

  protected toggleCountsCalculation(): void {
    this.calculateCounts.update((value) => !value);
  }
}
