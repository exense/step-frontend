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
import { BulkSelectionType, SelectionCollector } from '../../../entities-selection/entities-selection.module';
import { TableFilter } from '../../services/table-filter';
import { BulkOperationConfig, BulkOperationsInvokeService } from '../../services/bulk-operations-invoke.service';
import { BulkOperation } from '../../types/bulk-operation';
import { TableReload } from '../../services/table-reload';
import { map, of } from 'rxjs';
import { AsyncOperationCloseStatus } from '../../../async-operations/async-operations.module';
import {
  EntityBulkOperationInfo,
  EntityBulkOperationsRegistryService,
} from '../../../custom-registeries/custom-registries.module';
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

  protected trackByLegacy: TrackByFunction<BulkOperation> = (_, item) => item.operation;
  protected trackByNew: TrackByFunction<EntityBulkOperationInfo> = (_, item) => item.type;

  @Input() selectionType: BulkSelectionType = BulkSelectionType.None;
  @Output() selectionTypeChange = new EventEmitter<BulkSelectionType>();

  /**
   * @deprecated
   * Still left to support legacy approach. Will be removed soon.
   * **/
  @Input('availableOperations') availableOperationsLegacy?: BulkOperation[];
  @Input() entity?: string;

  readonly isOperationsDisabled$ = (this._selectionCollector?.selected$ || of([])).pipe(
    map((selected) => selected.length === 0)
  );

  invoke(operation: BulkOperation | EntityBulkOperationInfo): void {
    const isLegacy = typeof operation.operation === 'string';
    const operationLegacy = isLegacy ? (operation as BulkOperation) : undefined;
    const operationNew = !isLegacy ? (operation as EntityBulkOperationInfo) : undefined;
    const operationType = isLegacy ? operationLegacy!.operation : operationNew!.type;

    if (!this.allowedOperations.includes(operationType)) {
      return;
    }

    if (!this._bulkOperationsInvoke || this.selectionType === BulkSelectionType.None) {
      return;
    }

    const config: BulkOperationConfig<KEY> = isLegacy
      ? {
          selectionType: this.selectionType,
          operationType: operationLegacy!.operation,
          withPreview: true,
        }
      : {
          selectionType: this.selectionType,
          operationInfo: operationNew,
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
    const cAvailableOperations = changes['availableOperations'];

    let entity: string | undefined;
    let operations: BulkOperation[] | undefined;

    if (cEntity?.currentValue !== cEntity?.previousValue || cEntity?.firstChange) {
      entity = cEntity?.currentValue;
    }

    if (
      cAvailableOperations?.currentValue !== cAvailableOperations?.previousValue ||
      cAvailableOperations?.firstChange
    ) {
      operations = cAvailableOperations.currentValue;
    }

    if (entity || operations) {
      this.fillOperations(entity, operations);
    }
  }

  private fillOperations(entity?: string, operations?: BulkOperation[]): void {
    entity = entity ?? this.entity;
    operations = operations ?? this.availableOperationsLegacy;

    if (entity) {
      this.entityOperations = this._entityBulkOperationsRegistry.getEntityBulkOperations(entity);
      this.allowedOperations = this.entityOperations.map((item) => item.type);
    } else if (operations) {
      this.entityOperations = [];
      this.allowedOperations = operations.map((item) => item.operation);
    } else {
      this.entityOperations = [];
      this.allowedOperations = [];
    }
  }
}
