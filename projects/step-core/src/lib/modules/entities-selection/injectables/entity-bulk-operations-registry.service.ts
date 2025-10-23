import { inject, Injectable } from '@angular/core';
import { BulkOperationType } from '../../basics/types/bulk-operation-type.enum';
import { CustomRegistryService, CustomRegistryType } from '../../custom-registeries/custom-registries.module';
import {
  EntityBulkOperation,
  EntityBulkOperationInfo,
  EntityBulkOperationRegisterInfo,
} from '../types/entity-bulk-operation-info.interface';

const convert = ({
  operationType: type,
  label,
  entity,
  icon,
  operation,
  permission,
  performStrategy,
  order,
}: EntityBulkOperation): EntityBulkOperationInfo => ({
  type,
  label,
  entity,
  icon,
  operation,
  permission,
  performStrategy,
  order,
});

@Injectable({
  providedIn: 'root',
})
export class EntityBulkOperationsRegistryService {
  private _customRegistry = inject(CustomRegistryService);

  private readonly registryType = CustomRegistryType.ENTITY_BULK_OPERATIONS;

  private knownOperations: Record<BulkOperationType | string, { label?: string; icon?: string }> = {
    [BulkOperationType.DELETE]: { label: 'Delete selected', icon: 'trash-2' },
    [BulkOperationType.DUPLICATE]: { label: 'Clone selected', icon: 'copy' },
    [BulkOperationType.EXPORT]: { label: 'Export selected', icon: 'upload' },
    [BulkOperationType.RESTART]: { label: 'Restart selected', icon: 'play-circle' },
    [BulkOperationType.STOP]: { label: 'Stop selected', icon: 'stop-circle' },
    [BulkOperationType.CLOSE]: { label: 'Close selected', icon: 'x-circle' },
    [BulkOperationType.REFRESH]: { label: 'Refresh selected', icon: 'refresh-cw' },
  };

  register(
    entity: string,
    {
      type: operationType,
      label,
      icon,
      operation,
      performStrategy,
      permission,
      order,
    }: EntityBulkOperationRegisterInfo,
  ): this {
    const type = `${entity}_${operationType}`;

    icon = icon ?? this.knownOperations[operationType]?.icon;
    label = label ?? this.knownOperations[operationType]?.label ?? operationType;

    const bulkOperation: EntityBulkOperation = {
      type,
      label,
      entity,
      operationType,
      icon,
      operation,
      permission,
      performStrategy,
      order,
    };
    this._customRegistry.register(this.registryType, type, bulkOperation);
    return this;
  }

  getEntityBulkOperations(entity: string): EntityBulkOperationInfo[] {
    return (this._customRegistry.getRegisteredItems(this.registryType) as EntityBulkOperation[])
      .filter((item) => item.entity === entity)
      .map(convert)
      .sort((a, b) => {
        const orderA = a.order ?? Infinity;
        const orderB = b.order ?? Infinity;
        return orderA - orderB;
      });
  }

  getEntityBulkOperation(entity: string, operationType: string): EntityBulkOperationInfo | undefined {
    const type = `${entity}_${operationType}`;
    const item = this._customRegistry.getRegisteredItem(this.registryType, type) as EntityBulkOperation;
    if (!item) {
      return undefined;
    }
    return convert(item);
  }
}
