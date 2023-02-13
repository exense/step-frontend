import { Component, EventEmitter, Input, Optional, Output } from '@angular/core';
import { BulkSelectionType, SelectionCollector } from '../../../entities-selection/entities-selection.module';
import { TableFilter } from '../../services/table-filter';
import { BulkOperationConfig, BulkOperationsInvokeService } from '../../services/bulk-operations-invoke.service';
import { BulkOperation } from '../../types/bulk-operation';
import { TableReload } from '../../services/table-reload';
import { map, of } from 'rxjs';
import { AsyncOperationCloseStatus } from '../../../async-operations/async-operations.module';

@Component({
  selector: 'step-bulk-operations',
  templateUrl: './bulk-operations.component.html',
  styleUrls: ['./bulk-operations.component.scss'],
})
export class BulkOperationsComponent<KEY, ENTITY> {
  @Input() selectionType: BulkSelectionType = BulkSelectionType.None;
  @Output() selectionTypeChange = new EventEmitter<BulkSelectionType>();
  @Input() availableOperations: BulkOperation[] = [];

  readonly isOperationsDisabled$ = (this._selectionCollector?.selected$ || of([])).pipe(
    map((selected) => selected.length === 0)
  );

  constructor(
    @Optional() public _selectionCollector?: SelectionCollector<KEY, ENTITY>,
    @Optional() private _tableFilter?: TableFilter,
    @Optional() private _tableReload?: TableReload,
    @Optional() private _bulkOperationsInvoke?: BulkOperationsInvokeService<KEY>
  ) {}

  invoke(operation: BulkOperation): void {
    if (!this.availableOperations.includes(operation)) {
      return;
    }

    if (!this._bulkOperationsInvoke || this.selectionType === BulkSelectionType.None) {
      return;
    }

    const config: BulkOperationConfig<KEY> = {
      selectionType: this.selectionType,
      operationType: operation.operation,
      withPreview: true,
    };

    if (this.selectionType === BulkSelectionType.Filtered) {
      config.filterRequest = this._tableFilter?.getTableFilterRequest() || undefined;
    }

    if (this.selectionType === BulkSelectionType.Individual || this.selectionType === BulkSelectionType.Visible) {
      config.ids = this._selectionCollector?.selected || undefined;
    }

    this._bulkOperationsInvoke.invoke(config).subscribe((result) => {
      if (result?.closeStatus !== AsyncOperationCloseStatus.success) {
        return;
      }
      this._tableReload?.reload();
      if (this._selectionCollector) {
        this._selectionCollector.clear();
      }
    });
  }
}
