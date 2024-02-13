import { Component, inject, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import {
  ArrayFilterComponent,
  AugmentedExecutionsService,
  AutoDeselectStrategy,
  BulkSelectionType,
  DateFormat,
  ExecutiontTaskParameters,
  FilterConditionFactoryService,
  selectionCollectionProvider,
  STORE_ALL,
  tablePersistenceConfigProvider,
} from '@exense/step-core';
import { EXECUTION_RESULT, EXECUTION_STATUS, Status } from '../../../_common/shared/status.enum';
import { BehaviorSubject, of, switchMap } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'step-execution-list',
  templateUrl: './execution-list.component.html',
  styleUrls: ['./execution-list.component.scss'],
  providers: [
    tablePersistenceConfigProvider('executionList', STORE_ALL),
    ...selectionCollectionProvider<string, ExecutiontTaskParameters>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER),
  ],
  encapsulation: ViewEncapsulation.None,
})
export class ExecutionListComponent implements OnDestroy {
  private reloadRunningExecutionsCount$ = new BehaviorSubject<void>(undefined);
  private _router = inject(Router);
  readonly _filterConditionFactory = inject(FilterConditionFactoryService);
  readonly _augmentedExecutionsService = inject(AugmentedExecutionsService);
  readonly dataSource = this._augmentedExecutionsService.getExecutionsTableDataSource();
  readonly DateFormat = DateFormat;
  readonly resultItems$ = of(EXECUTION_RESULT);
  readonly statusItems$ = of(EXECUTION_STATUS);
  readonly runningExecutionsCount$ = this.reloadRunningExecutionsCount$.pipe(
    switchMap(() => this._augmentedExecutionsService.countExecutionsByStatus(Status.RUNNING)),
  );
  autoRefreshDisabled: boolean = false;

  @ViewChild('statusFilter')
  private statusFilter?: ArrayFilterComponent;

  ngOnDestroy(): void {
    this.reloadRunningExecutionsCount$.complete();
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

  navigateToExecution(id: string): void {
    this._router.navigate(['root', 'executions', id], { queryParamsHandling: 'preserve' });
  }

  handleRunningStatusClick(): void {
    this.statusFilter?.filterControl.setValue([Status.RUNNING]);
  }
}
