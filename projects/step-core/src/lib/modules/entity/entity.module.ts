import { NgModule } from '@angular/core';
import { EntityIconComponent } from '../entity/components/entity-icon/entity-icon.component';
import { StepMaterialModule } from '../step-material/step-material.module';
import { CommonModule } from '@angular/common';
import { CustomRegistriesModule } from '../custom-registeries/custom-registries.module';
import { SelectEntityOfTypeComponent } from './components/select-entity-of-type/select-entity-of-type.component';
import { StepBasicsModule } from '../basics/step-basics.module';
import { EntityMenuComponent } from './components/entity-menu/entity-menu.component';
import { EntityMenuContentDirective } from './directives/entity-menu-content.directive';
import { CastEntityToPlanPipe } from './pipes/cast-entity-to-plan.pipe';
import { CastEntityToTaskPipe } from './pipes/cast-entity-to-task.pipe';
import { CastEntityToExecutionPipe } from './pipes/cast-entity-to-execution.pipe';

@NgModule({
  imports: [CommonModule, StepMaterialModule, CustomRegistriesModule, StepBasicsModule],
  declarations: [
    EntityIconComponent,
    SelectEntityOfTypeComponent,
    EntityMenuComponent,
    EntityMenuContentDirective,
    CastEntityToPlanPipe,
    CastEntityToTaskPipe,
    CastEntityToExecutionPipe,
  ],
  exports: [
    EntityIconComponent,
    SelectEntityOfTypeComponent,
    EntityMenuComponent,
    EntityMenuContentDirective,
    CastEntityToPlanPipe,
    CastEntityToTaskPipe,
    CastEntityToExecutionPipe,
  ],
})
export class EntityModule {}

export * from './components/entity-icon/entity-icon.component';
export * from './components/select-entity-of-type/select-entity-of-type.component';
export * from './components/base-entity-selection-table/base-entity-selection-table.component';
export * from './components/entity-menu/entity-menu.component';
export * from './directives/entity-menu-content.directive';
export * from './services/entity-registry';
export * from './services/entity-type-resolver';
export * from './services/entity-dialogs.service';
export * from './types/entity';
export * from './types/entity-object';
export * from './types/entity-meta';
export * from './types/select-entity-of-type-result.interface';
export * from './types/select-entity-context.interface';
