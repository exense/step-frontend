import { inject, Injectable } from '@angular/core';
import { AsyncTaskStatus, TableBulkOperationRequest } from '../../../client/step-client-module';
import { Observable } from 'rxjs';
import { BulkOperationType } from '../../basics/shared/bulk-operation-type.enum';
import { CustomRegistryItem } from '../shared/custom-registry-item';
import { CustomRegistryService } from './custom-registry.service';
import { CustomRegistryType } from '../shared/custom-registry-type.enum';

type BulkOperation = (requestBody?: TableBulkOperationRequest) => Observable<AsyncTaskStatus>;

interface EntityBulkOperation extends CustomRegistryItem {
  operationType: string;
  entity: string;
  operation: BulkOperation;
  icon?: string;
  permission?: string;
}

export type EntityBulkOperationInfo = Omit<EntityBulkOperation, 'label' | 'entity' | 'component' | 'operationType'> &
  Partial<Pick<EntityBulkOperation, 'label'>>;

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

  register(entity: string, { type: operationType, label, icon, operation, permission }: EntityBulkOperationInfo): this {
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
    };
    this._customRegistry.register(this.registryType, type, bulkOperation);
    return this;
  }

  getEntityBulkOperations(entity: string): EntityBulkOperationInfo[] {
    return (this._customRegistry.getRegisteredItems(this.registryType) as EntityBulkOperation[])
      .filter((item) => item.entity === entity)
      .map(({ operationType: type, label, icon, operation, permission }) => ({
        type,
        label,
        icon,
        operation,
        permission,
      }));
  }
}
