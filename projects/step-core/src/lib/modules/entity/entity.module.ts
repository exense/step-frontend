import { NgModule } from '@angular/core';
import { EntityIconComponent } from '../entity/components/entity-icon/entity-icon.component';
import { StepMaterialModule } from '../step-material/step-material.module';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [CommonModule, StepMaterialModule],
  declarations: [EntityIconComponent],
  exports: [EntityIconComponent],
})
export class EntityModule {}

export * from '../entity/components/entity-icon/entity-icon.component';
export * from '../entity/services/entity-registry';
export * from '../entity/services/entity-scope-resolver';
