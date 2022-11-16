import { NgModule } from '@angular/core';
import { PlanListComponent } from './components/plan-list/plan-list.component';
import { StepCommonModule } from '../_common/step-common.module';
import { PlanOtherplanListComponent } from './components/plan-otherplan-list/plan-otherplan-list.component';
import { PlanFunctionListComponent } from './components/plan-function-list/plan-function-list.component';
import { PlanArtefactListComponent } from './components/plan-artefact-list/plan-artefact-list.component';
import { CustomCellRegistryService, EntityRegistry, PlanTypeRegistryService } from '@exense/step-core';
import { PlanIconComponent } from './components/plan-icon/plan-icon.component';
import { PlanTreeComponent } from './components/plan-tree/plan-tree.component';
import { PlanEditorComponent } from './components/plan-editor/plan-editor.component';
import { PlanEditorKeyHandlerDirective } from './directives/plan-editor-key-handler.directive';
import { ExecutionModule } from '../execution/execution.module';
import { PlanLinkComponent } from '../_common/components/plan-link/plan-link.component';

@NgModule({
  declarations: [
    PlanListComponent,
    PlanOtherplanListComponent,
    PlanFunctionListComponent,
    PlanArtefactListComponent,
    PlanIconComponent,
    PlanTreeComponent,
    PlanEditorComponent,
    PlanEditorKeyHandlerDirective,
  ],
  imports: [StepCommonModule, ExecutionModule],
  exports: [PlanListComponent, PlanOtherplanListComponent, PlanFunctionListComponent, PlanArtefactListComponent],
})
export class PlanModule {
  constructor(
    _entityRegistry: EntityRegistry,
    _cellsRegister: CustomCellRegistryService,
    _planTypeRegistry: PlanTypeRegistryService
  ) {
    _entityRegistry.register('plans', 'Plan', 'file', '/partials/plans/planSelectionTable.html');
    _cellsRegister.registerCell('planEntityIcon', PlanIconComponent);
    _cellsRegister.registerCell('planLink', PlanLinkComponent);
    _planTypeRegistry.register('step.core.plans.Plan', 'Default', PlanTreeComponent);
  }
}
