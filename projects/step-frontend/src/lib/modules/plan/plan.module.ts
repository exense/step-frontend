import { NgModule } from '@angular/core';
import {
  CustomCellRegistryService,
  EntityRegistry,
  PlanLinkComponent,
  PlanTypeRegistryService,
} from '@exense/step-core';
import { ExecutionModule } from '../execution/execution.module';
import { StepCommonModule } from '../_common/step-common.module';
import { PlanIconComponent } from './components/plan-icon/plan-icon.component';
import { PlanListComponent } from './components/plan-list/plan-list.component';
import { PlanEditorKeyHandlerDirective } from './directives/plan-editor-key-handler.directive';
import { PlanTreeEditorComponent } from './components/plan-tree-editor/plan-tree-editor.component';
import { PlanEditorModule } from '../plan-editor/plan-editor.module';

@NgModule({
  declarations: [PlanListComponent, PlanIconComponent, PlanEditorKeyHandlerDirective, PlanTreeEditorComponent],
  imports: [StepCommonModule, ExecutionModule, PlanEditorModule],
  exports: [PlanEditorModule, PlanListComponent],
})
export class PlanModule {
  constructor(
    _entityRegistry: EntityRegistry,
    _cellsRegister: CustomCellRegistryService,
    _planTypeRegistry: PlanTypeRegistryService
  ) {
    _entityRegistry.register('plans', 'Plan', { icon: 'file', templateUrl: '/partials/plans/planSelectionTable.html' });
    _cellsRegister.registerCell('planEntityIcon', PlanIconComponent);
    _cellsRegister.registerCell('planLink', PlanLinkComponent);
    _planTypeRegistry.register('step.core.plans.Plan', 'Visual plan editor', PlanTreeEditorComponent);
  }
}
