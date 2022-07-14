import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntitySelectionComponent } from './components/entity-selection/entity-selection.component';
import { StepMaterialModule } from '../step-material/step-material.module';

@NgModule({
  declarations: [EntitySelectionComponent],
  imports: [CommonModule, StepMaterialModule],
  exports: [EntitySelectionComponent],
})
export class EntitiesSelectionModule {}

export * from './services/selection-collector/selection-collector';
export * from './services/selection-collector/selection-collector-factory.service';
