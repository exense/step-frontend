import { Component, Input, Optional } from '@angular/core';
import { BulkSelectionType, SelectionCollector } from '../../../entities-selection/entities-selection.module';
import { TableFilter } from '../../services/table-filter';
import { BulkOperationConfig, BulkOperationsInvokeService } from '../../services/bulk-operations-invoke.service';
import { BulkOperation } from '../../shared/bulk-operation.enum';
import { DialogsService } from '../../../../shared';
import { TableReload } from '../../services/table-reload';

@Component({
  selector: 'step-bulk-operations',
  templateUrl: './bulk-operations.component.html',
  styleUrls: ['./bulk-operations.component.scss'],
})
export class BulkOperationsComponent<KEY, ENTITY> {
  selectionType: BulkSelectionType = BulkSelectionType.None;

  @Input() availableOperations: BulkOperation[] = [];

  constructor(
    private _dialogs: DialogsService,
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
      operationType: operation,
      isDraft: true,
    };

    if (this.selectionType === BulkSelectionType.Filtered) {
      config.filterRequest = this._tableFilter?.getTableFilterRequest() || undefined;
    }

    if (this.selectionType === BulkSelectionType.Individual || this.selectionType === BulkSelectionType.Visible) {
      config.ids = this._selectionCollector?.selected || undefined;
    }

    this._bulkOperationsInvoke.invoke(config).subscribe((status) => {
      if (!status?.ready) {
        return;
      }
      const message = `Bulk ${operation} completed`;
      this._dialogs.showInfo(message);
      this._tableReload?.reload();
      if (this._selectionCollector) {
        this._selectionCollector.clear();
      }
    });
  }
}
