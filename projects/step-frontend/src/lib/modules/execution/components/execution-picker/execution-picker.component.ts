import { Component, inject } from '@angular/core';
import {
  AugmentedExecutionsService,
  BulkSelectionType,
  DateFormat,
  FilterConditionFactoryService,
  STORE_ALL,
  tablePersistenceConfigProvider,
} from '@exense/step-core';
import { EXECUTION_RESULT, EXECUTION_STATUS } from '../../../_common/shared/status.enum';
import { of } from 'rxjs';

@Component({
  selector: 'step-execution-list',
  templateUrl: './execution-picker.component.html',
  styleUrls: ['./execution-picker.component.scss'],
  providers: [tablePersistenceConfigProvider('executionList', STORE_ALL)],
})
export class ExecutionPickerComponent {
  readonly _filterConditionFactory = inject(FilterConditionFactoryService);
  readonly _augmentedExecutionsService = inject(AugmentedExecutionsService);
  readonly dataSource = this._augmentedExecutionsService.getExecutionsTableDataSource();
  readonly DateFormat = DateFormat;
  readonly resultItems$ = of(EXECUTION_RESULT);
  readonly statusItems$ = of(EXECUTION_STATUS);
  autoRefreshDisabled: boolean = false;

  changeType(selectionType: BulkSelectionType): void {
    this.autoRefreshDisabled = selectionType !== BulkSelectionType.NONE;

    if (this.autoRefreshDisabled) {
      this.dataSource.skipOngoingRequest();
    }
  }

  refreshTable(): void {
    this.dataSource.reload({ hideProgress: true });
  }
}
