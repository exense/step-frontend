import { NgModule } from '@angular/core';
import { EntityIconComponent } from '../entity/components/entity-icon/entity-icon.component';
import { StepMaterialModule } from '../step-material/step-material.module';
import { CommonModule } from '@angular/common';
import { CustomRegistriesModule } from '../custom-registeries/custom-registries.module';

@NgModule({
  imports: [CommonModule, StepMaterialModule, CustomRegistriesModule],
  declarations: [EntityIconComponent],
  exports: [EntityIconComponent],
})
export class EntityModule {}

export * from './components/entity-icon/entity-icon.component';
export * from './services/entity-registry';
export * from './services/entity-scope-resolver';
export * from './types/entity';
