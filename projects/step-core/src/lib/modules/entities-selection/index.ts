import { EntitySelectionComponent } from './components/entity-selection/entity-selection.component';
import { BulkSelectionLabelComponent } from './components/bulk-selection-label/bulk-selection-label.component';
import { BulkSelectionComponent } from './components/bulk-selection/bulk-selection.component';

export const ENTITIES_SELECTION_EXPORTS = [
  EntitySelectionComponent,
  BulkSelectionLabelComponent,
  BulkSelectionComponent,
];

export * from './injectables/has-filter';
export * from './injectables/entity-bulk-operations-registry.service';
export * from './injectables/bulk-operation-invoker.service';
export * from './components/entity-selection/entity-selection.component';
export * from './types/bulk-selection-type.enum';
export * from './types/bulk-operation.type';
export * from './types/bulk-operation-config.interface';
export { EntityBulkOperationRegisterInfo, EntityBulkOperationInfo } from './types/entity-bulk-operation-info.interface';
export * from './types/bulk-operation-perform.strategy';

export * from './injectables/selection/selection-list';
export * from './injectables/selection/entity-selection-state';
export * from './injectables/selection/entity-selection-state-impl';
export * from './injectables/selection/entity-selection-state.provider';
export * from './components/bulk-selection/bulk-selection.component';
export * from './components/bulk-selection-label/bulk-selection-label.component';
