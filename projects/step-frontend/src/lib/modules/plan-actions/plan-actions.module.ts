import { NgModule } from '@angular/core';
import { PlanDeleteAction } from './injectables/plan-delete.action';
import { PlanDeleteConfirmAction } from './injectables/plan-delete-confirm.action';
import { PlanEditAction } from './injectables/plan-edit.action';
import { PlanEditCheckProjectAction } from './injectables/plan-edit-check-project.action';
import { EntityActionRegistryService, StepCoreModule } from '@exense/step-core';

@NgModule({
  declarations: [],
  imports: [StepCoreModule],
})
export class PlanActionsModule {
  constructor(_entityActionRegistry: EntityActionRegistryService) {
    console.log('REGISTER PLAN ACTIONS');
    _entityActionRegistry
      .register(PlanDeleteAction)
      .register(PlanDeleteConfirmAction)
      .register(PlanEditAction)
      .register(PlanEditCheckProjectAction);
  }
}
