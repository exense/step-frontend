import { NgModule } from '@angular/core';
import { PlanListComponent } from './components/plan-list/plan-list.component';
import { StepCommonModule } from '../_common/step-common.module';
import { PlanOtherplanListComponent } from './components/plan-otherplan-list/plan-otherplan-list.component';
import { PlanFunctionListComponent } from './components/plan-function-list/plan-function-list.component';
import { PlanArtefactListComponent } from './components/plan-artefact-list/plan-artefact-list.component';
import { CustomCellRegistryService, EntityRegistry } from '@exense/step-core';
import { PlanIconComponent } from './components/plan-icon/plan-icon.component';
import { PlanLinkComponent } from './components/plan-link/plan-link.component';

@NgModule({
  declarations: [
    PlanListComponent,
    PlanOtherplanListComponent,
    PlanFunctionListComponent,
    PlanArtefactListComponent,
    PlanIconComponent,
    PlanLinkComponent,
  ],
  imports: [StepCommonModule],
  exports: [PlanListComponent, PlanOtherplanListComponent, PlanFunctionListComponent, PlanArtefactListComponent],
})
export class PlanModule {
  constructor(_entityRegistry: EntityRegistry, _cellsRegister: CustomCellRegistryService) {
    _entityRegistry.register('plans', 'Plan', 'description', '/partials/plans/planSelectionTable.html');
    _cellsRegister.registerCell('planEntityIcon', PlanIconComponent);
    _cellsRegister.registerCell('planLink', PlanLinkComponent);
  }
}
