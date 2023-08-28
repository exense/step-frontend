import { Component, inject } from '@angular/core';
import {
  AJS_MODULE,
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
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { EXECUTION_RESULT, EXECUTION_STATUS } from '../../../_common/shared/status.enum';
import { of } from 'rxjs';

@Component({
  selector: 'step-execution-list',
  templateUrl: './execution-list.component.html',
  styleUrls: ['./execution-list.component.scss'],
  providers: [
    tablePersistenceConfigProvider('executionList', STORE_ALL),
    selectionCollectionProvider<string, ExecutiontTaskParameters>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER),
  ],
})
export class ExecutionListComponent {
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
  .directive('stepExecutionList', downgradeComponent({ component: ExecutionListComponent }));
