import { Component, inject, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import {
  ArrayFilterComponent,
  AugmentedExecutionsService,
  AutoDeselectStrategy,
  BulkSelectionType,
  DateFormat,
  ExecutiontTaskParameters,
  FilterConditionFactoryService,
  REQUEST_FILTERS_INTERCEPTORS,
  RequestFilterInterceptor,
  selectionCollectionProvider,
  STORE_ALL,
  tableColumnsConfigProvider,
  tablePersistenceConfigProvider,
} from '@exense/step-core';
import { EXECUTION_STATUS_TREE, Status } from '../../../_common/step-common.module';
import { BehaviorSubject, of, switchMap } from 'rxjs';
import { ExecutionListFilterInterceptorService } from '../../services/execution-list-filter-interceptor.service';
import { TimeSeriesEntityService } from '../../../timeseries/modules/_common';

@Component({
  selector: 'step-execution-list',
  templateUrl: './execution-list.component.html',
  styleUrls: ['./execution-list.component.scss'],
  providers: [
    tableColumnsConfigProvider({
      entityTableRemoteId: AugmentedExecutionsService.EXECUTIONS_TABLE_ID,
      entityScreenId: 'executionParameters',
      entityScreenSubPath: 'executionParameters.customParameters',
      allowDefaultVisibilityConfiguration: true,
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
export class ExecutionListComponent implements OnDestroy {
  private reloadRunningExecutionsCount$ = new BehaviorSubject<void>(undefined);
  readonly _filterConditionFactory = inject(FilterConditionFactoryService);
  readonly _augmentedExecutionsService = inject(AugmentedExecutionsService);
  private _timeSeriesEntityService = inject(TimeSeriesEntityService);
  readonly dataSource = this._augmentedExecutionsService.getExecutionsTableDataSource();
  readonly DateFormat = DateFormat;
  readonly statusItemsTree$ = of(EXECUTION_STATUS_TREE);
  readonly runningExecutionsCount$ = this.reloadRunningExecutionsCount$.pipe(
    switchMap(() => this._augmentedExecutionsService.countExecutionsByStatus(Status.RUNNING)),
  );

  autoRefreshDisabled: boolean = false;

  @ViewChild('statusFilter')
  private statusFilter?: ArrayFilterComponent;

  ngOnDestroy(): void {
    this.reloadRunningExecutionsCount$.complete();
    this._timeSeriesEntityService.clearCache();
  }

  changeType(selectionType: BulkSelectionType): void {
    this.autoRefreshDisabled = selectionType !== BulkSelectionType.NONE;

    if (this.autoRefreshDisabled) {
      this.dataSource.skipOngoingRequest();
    }
  }

  refreshTable(): void {
    this.dataSource.reload({ hideProgress: true });
    this.reloadRunningExecutionsCount$.next();
  }

  handleRunningStatusClick(): void {
    this.statusFilter?.filterControl.setValue([Status.RUNNING]);
  }
}
