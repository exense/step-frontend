import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntitySelectionComponent } from './components/entity-selection/entity-selection.component';
import { StepMaterialModule } from '../step-material/step-material.module';
import { BulkSelectionComponent } from './components/bulk-selection/bulk-selection.component';
import { BulkSelectionDiComponent } from './components/bulk-selection/bulk-selection-di.component';
import { EntitySelectionDiComponent } from './components/entity-selection/entity-selection-di.component';
import { BulkSelectionLabelComponent } from './components/bulk-selection-label/bulk-selection-label.component';
import { IsSelectedPipe } from './pipes/is-selected.pipe';

@NgModule({
  declarations: [
    EntitySelectionComponent,
    EntitySelectionDiComponent,
    BulkSelectionComponent,
    BulkSelectionDiComponent,
    BulkSelectionLabelComponent,
    IsSelectedPipe,
  ],
  imports: [CommonModule, StepMaterialModule],
  exports: [
    EntitySelectionComponent,
    EntitySelectionDiComponent,
    BulkSelectionComponent,
    BulkSelectionDiComponent,
    BulkSelectionLabelComponent,
    IsSelectedPipe,
  ],
})
export class EntitiesSelectionModule {}

export * from './services/selection-collector/selection-collector';
export * from './services/selection-collector/selection-collector-factory.service';
export * from './services/selection-collector/selection-collector-container';
export * from './services/selection-collector.provider';
export * from './services/has-filter';
export * from './services/entity-bulk-operations-registry.service';
export * from './services/bulk-operation-invoker.service';
export * from './components/entity-selection/entity-selection.component';
export * from './components/entity-selection/entity-selection-di.component';
export * from './components/bulk-selection/bulk-selection.component';
export * from './components/bulk-selection/bulk-selection-di.component';
export * from './components/bulk-selection-label/bulk-selection-label.component';
export * from './shared/auto-deselect-strategy.enum';
export * from './shared/bulk-selection-type.enum';
export * from './shared/registration.strategy';
export * from './shared/bulk-operation.type';
export * from './shared/bulk-operation-config.interface';
export {
  EntityBulkOperationRegisterInfo,
  EntityBulkOperationInfo,
} from './shared/entity-bulk-operation-info.interface';
export * from './shared/bulk-operation-perform.strategy';
export * from './pipes/is-selected.pipe';
