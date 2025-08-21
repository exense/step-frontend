import { CustomRegistryItem } from '../../custom-registeries/custom-registries.module';
import { BulkOperation } from './bulk-operation.type';
import { BulkOperationPerformStrategy } from './bulk-operation-perform.strategy';
import { Type } from '@angular/core';

export interface EntityBulkOperation extends CustomRegistryItem {
  operationType: string;
  entity: string;
  operation: BulkOperation;
  icon?: string;
  permission?: string;
  performStrategy?: Type<BulkOperationPerformStrategy>;
  order?: number;
}

export type EntityBulkOperationRegisterInfo = Omit<
  EntityBulkOperation,
  'label' | 'entity' | 'component' | 'operationType'
> &
  Partial<Pick<EntityBulkOperation, 'label'>>;

export type EntityBulkOperationInfo = EntityBulkOperationRegisterInfo & Pick<EntityBulkOperation, 'entity'>;
