import { NgModule } from '@angular/core';
import { CustomCellRegistryService, EntityRegistry, PlanLinkComponent, ViewRegistryService } from '@exense/step-core';
import { ExecutionModule } from '../execution/execution.module';
import { StepCommonModule } from '../_common/step-common.module';
import { PlanIconComponent } from './components/plan-icon/plan-icon.component';
import { PlanListComponent } from './components/plan-list/plan-list.component';
import { PlanEditorKeyHandlerDirective } from './directives/plan-editor-key-handler.directive';
import { PlanEditorModule } from '../plan-editor/plan-editor.module';
import { PlanEditorComponent } from './components/plan-editor/plan-editor.component';

@NgModule({
  declarations: [PlanListComponent, PlanIconComponent, PlanEditorKeyHandlerDirective, PlanEditorComponent],
  imports: [StepCommonModule, ExecutionModule, PlanEditorModule],
  exports: [PlanEditorModule, PlanListComponent, PlanEditorComponent],
})
export class PlanModule {
  constructor(
    _entityRegistry: EntityRegistry,
    _cellsRegister: CustomCellRegistryService,
    _viewRegistry: ViewRegistryService
  ) {
    _entityRegistry.register('plans', 'Plan', { icon: 'file', templateUrl: '/partials/plans/planSelectionTable.html' });
    _cellsRegister.registerCell('planEntityIcon', PlanIconComponent);
    _cellsRegister.registerCell('planLink', PlanLinkComponent);
    _viewRegistry.registerView('plans', 'partials/plans/plans.html');
  }
}
