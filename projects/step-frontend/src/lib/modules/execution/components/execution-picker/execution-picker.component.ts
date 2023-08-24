import { Component, inject } from '@angular/core';
import {
  AJS_MODULE,
  AugmentedExecutionsService,
  AutoDeselectStrategy,
  BulkOperationsInvokeService,
  BulkOperationType,
  BulkSelectionType,
  DateFormat,
  ExecutiontTaskParameters,
  FilterConditionFactoryService,
  selectionCollectionProvider,
  STORE_ALL,
  tablePersistenceConfigProvider,
} from '@exense/step-core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { EXECUTION_RESULT, EXECUTION_STATUS } from '../../../_common/shared/status.enum';
import { of } from 'rxjs';
import { ExecutionBulkOperationsInvokeService } from '../../services/execution-bulk-operations-invoke.service';

@Component({
  selector: 'step-execution-list',
  templateUrl: './execution-picker.component.html',
  styleUrls: ['./execution-picker.component.scss'],
  providers: [
    tablePersistenceConfigProvider('executionList', STORE_ALL),
    selectionCollectionProvider<string, ExecutiontTaskParameters>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER),
    {
      provide: BulkOperationsInvokeService,
      useClass: ExecutionBulkOperationsInvokeService,
    },
  ],
})
export class ExecutionPickerComponent {
  readonly availableBulkOperations = [
    { operation: BulkOperationType.delete, permission: 'execution-delete' },
    { operation: BulkOperationType.restart, permission: 'plan-execute' },
    { operation: BulkOperationType.stop, permission: 'plan-execute' },
  ];
  readonly _filterConditionFactory = inject(FilterConditionFactoryService);
  readonly _augmentedExecutionsService = inject(AugmentedExecutionsService);
  readonly dataSource = this._augmentedExecutionsService.getExecutionsTableDataSource();
  readonly DateFormat = DateFormat;
  readonly resultItems$ = of(EXECUTION_RESULT);
  readonly statusItems$ = of(EXECUTION_STATUS);
  autoRefreshDisabled: boolean = false;

  changeType(selectionType: BulkSelectionType): void {
    this.autoRefreshDisabled = selectionType !== BulkSelectionType.None;

    if (this.autoRefreshDisabled) {
      this.dataSource.skipOngoingRequest();
    }
  }

  refreshTable(): void {
    this.dataSource.reload({ hideProgress: true });
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepExecutionList', downgradeComponent({ component: ExecutionPickerComponent }));
