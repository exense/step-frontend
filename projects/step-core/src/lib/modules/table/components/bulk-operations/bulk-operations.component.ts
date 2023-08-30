import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TrackByFunction,
} from '@angular/core';
import {
  BulkOperationConfig,
  BulkOperationsInvokeService,
  BulkSelectionType,
  EntityBulkOperationsRegistryService,
  SelectionCollector,
  EntityBulkOperationInfo,
} from '../../../entities-selection/entities-selection.module';
import { TableFilter } from '../../services/table-filter';
import { TableReload } from '../../services/table-reload';
import { map, of } from 'rxjs';
import { AsyncOperationCloseStatus } from '../../../async-operations/async-operations.module';
import { BulkOperationType } from '../../../basics/shared/bulk-operation-type.enum';

@Component({
  selector: 'step-bulk-operations',
  templateUrl: './bulk-operations.component.html',
  styleUrls: ['./bulk-operations.component.scss'],
})
export class BulkOperationsComponent<KEY, ENTITY> implements OnChanges {
  private _tableFilter = inject(TableFilter, { optional: true });
  private _tableReload = inject(TableReload, { optional: true });
  private _bulkOperationsInvoke = inject<BulkOperationsInvokeService<KEY>>(BulkOperationsInvokeService);
  private _entityBulkOperationsRegistry = inject(EntityBulkOperationsRegistryService);
  readonly _selectionCollector = inject<SelectionCollector<KEY, ENTITY>>(SelectionCollector, { optional: true });

  private allowedOperations: (string | BulkOperationType)[] = [];

  protected entityOperations: EntityBulkOperationInfo[] = [];

  protected trackByOperation: TrackByFunction<EntityBulkOperationInfo> = (_, item) => item.type;

  @Input() selectionType: BulkSelectionType = BulkSelectionType.None;
  @Output() selectionTypeChange = new EventEmitter<BulkSelectionType>();

  @Input() entity?: string;

  readonly isOperationsDisabled$ = (this._selectionCollector?.selected$ || of([])).pipe(
    map((selected) => selected.length === 0)
  );

  invoke(operation: EntityBulkOperationInfo): void {
    if (!this.allowedOperations.includes(operation.type)) {
      return;
    }

    if (!this._bulkOperationsInvoke || this.selectionType === BulkSelectionType.None) {
      return;
    }

    const config: BulkOperationConfig<KEY> = {
      selectionType: this.selectionType,
      operationInfo: operation,
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

  ngOnChanges(changes: SimpleChanges): void {
    const cEntity = changes['entity'];

    if (cEntity?.currentValue !== cEntity?.previousValue || cEntity?.firstChange) {
      this.fillOperations(cEntity?.currentValue);
    }
  }

  private fillOperations(entity?: string): void {
    entity = entity ?? this.entity;

    if (entity) {
      this.entityOperations = this._entityBulkOperationsRegistry.getEntityBulkOperations(entity);
      this.allowedOperations = this.entityOperations.map((item) => item.type);
    } else {
      this.entityOperations = [];
      this.allowedOperations = [];
    }
  }
}
