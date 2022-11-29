import { NgModule } from '@angular/core';
import {
  CustomCellRegistryService,
  EntityRegistry,
  PlanLinkComponent,
  PlanTypeRegistryService,
} from '@exense/step-core';
import { ExecutionModule } from '../execution/execution.module';
import { StepCommonModule } from '../_common/step-common.module';
import { PlanArtefactListComponent } from './components/plan-artefact-list/plan-artefact-list.component';
import { PlanEditorComponent } from './components/plan-editor/plan-editor.component';
import { PlanFunctionListComponent } from './components/plan-function-list/plan-function-list.component';
import { PlanIconComponent } from './components/plan-icon/plan-icon.component';
import { PlanListComponent } from './components/plan-list/plan-list.component';
import { PlanOtherplanListComponent } from './components/plan-otherplan-list/plan-otherplan-list.component';
import { PlanTreeComponent } from './components/plan-tree/plan-tree.component';
import { PlanEditorKeyHandlerDirective } from './directives/plan-editor-key-handler.directive';

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
