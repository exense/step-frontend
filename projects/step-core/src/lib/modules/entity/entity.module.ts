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
import { EntityMenuButtonComponent } from './components/entity-menu-button/entity-menu-button.component';
import { EntityMenuItemDirective } from './directives/entity-menu-item.directive';
import { TableModule } from '../table/table.module';
import { EntityColumnComponent } from './components/entity-column/entity-column.component';
import { EntityColumnContainerComponent } from './components/entity-column-container/entity-column-container.component';

@NgModule({
  imports: [
    CommonModule,
    StepMaterialModule,
    CustomRegistriesModule,
    StepBasicsModule,
    TableModule,
    EntityMenuComponent,
    EntityMenuContentDirective,
    EntityMenuItemDirective,
  ],
  declarations: [
    EntityIconComponent,
    SelectEntityOfTypeComponent,
    CastEntityToPlanPipe,
    CastEntityToTaskPipe,
    CastEntityToExecutionPipe,
    EntityMenuButtonComponent,
    EntityColumnComponent,
    EntityColumnContainerComponent,
  ],
  exports: [
    EntityIconComponent,
    SelectEntityOfTypeComponent,
    EntityMenuComponent,
    EntityMenuContentDirective,
    CastEntityToPlanPipe,
    CastEntityToTaskPipe,
    CastEntityToExecutionPipe,
    EntityMenuButtonComponent,
    EntityColumnComponent,
    EntityColumnContainerComponent,
  ],
})
export class EntityModule {}

export * from './components/entity-icon/entity-icon.component';
export * from './components/select-entity-of-type/select-entity-of-type.component';
export * from './components/base-entity-selection-table/base-entity-selection-table.component';
export * from './components/entity-menu/entity-menu.component';
export * from './components/entity-menu-button/entity-menu-button.component';
export * from './components/entity-column/entity-column.component';
export * from './components/entity-column-container/entity-column-container.component';
export * from './directives/entity-menu-content.directive';
export * from './directives/entity-menu-item.directive';
export * from './directives/entity-menu-item.directive';
export * from './directives/entity-ref.directive';
export * from './injectables/entity-registry';
export * from './injectables/entity-type-resolver';
export * from './injectables/entity-dialogs.service';
export * from './injectables/entity-ref.service';
export * from './types/entity';
export * from './types/entity-object';
export * from './types/entity-meta';
export * from './types/select-entity-of-type-result.interface';
export * from './types/select-entity-context.interface';
