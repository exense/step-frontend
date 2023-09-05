import { inject, Injectable } from '@angular/core';
import { BulkOperationType } from '../../basics/shared/bulk-operation-type.enum';
import { CustomRegistryService, CustomRegistryType } from '../../custom-registeries/custom-registries.module';
import {
  EntityBulkOperation,
  EntityBulkOperationInfo,
  EntityBulkOperationRegisterInfo,
} from '../shared/entity-bulk-operation-info.interface';

const convert = ({
  operationType: type,
  label,
  entity,
  icon,
  operation,
  permission,
  performStrategy,
}: EntityBulkOperation): EntityBulkOperationInfo => ({
  type,
  label,
  entity,
  icon,
  operation,
  permission,
  performStrategy,
});

@Injectable({
  providedIn: 'root',
})
export class EntityBulkOperationsRegistryService {
  private _customRegistry = inject(CustomRegistryService);

  private readonly registryType = CustomRegistryType.entityBulkOperations;

  private knownOperations: Record<BulkOperationType | string, { label?: string; icon?: string }> = {
    [BulkOperationType.delete]: { label: 'Delete selected', icon: 'trash-2' },
    [BulkOperationType.duplicate]: { label: 'Clone selected', icon: 'copy' },
    [BulkOperationType.export]: { label: 'Export selected', icon: 'upload' },
    [BulkOperationType.restart]: { label: 'Restart selected', icon: 'play-circle' },
    [BulkOperationType.stop]: { label: 'Stop selected', icon: 'stop-circle' },
  };

  register(
    entity: string,
    { type: operationType, label, icon, operation, performStrategy, permission }: EntityBulkOperationRegisterInfo
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
    };
    this._customRegistry.register(this.registryType, type, bulkOperation);
    return this;
  }

  getEntityBulkOperations(entity: string): EntityBulkOperationInfo[] {
    return (this._customRegistry.getRegisteredItems(this.registryType) as EntityBulkOperation[])
      .filter((item) => item.entity === entity)
      .map(convert);
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
