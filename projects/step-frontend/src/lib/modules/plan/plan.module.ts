import { NgModule } from '@angular/core';
import { CustomCellRegistryService, EntityRegistry, PlanLinkComponent, ViewRegistryService } from '@exense/step-core';
import { ExecutionModule } from '../execution/execution.module';
import { StepCommonModule } from '../_common/step-common.module';
import { PlanListComponent } from './components/plan-list/plan-list.component';
import { PlanEditorModule } from '../plan-editor/plan-editor.module';
import { PlanEditorComponent } from './components/plan-editor/plan-editor.component';
import { PlanSelectionComponent } from './components/plan-selection/plan-selection.component';

@NgModule({
  declarations: [PlanListComponent, PlanEditorComponent, PlanSelectionComponent],
  imports: [StepCommonModule, ExecutionModule, PlanEditorModule],
  exports: [PlanEditorModule, PlanListComponent, PlanEditorComponent, PlanSelectionComponent],
})
export class PlanModule {
  constructor(
    _entityRegistry: EntityRegistry,
    _cellsRegister: CustomCellRegistryService,
    _viewRegistry: ViewRegistryService
  ) {
    _entityRegistry.register('plans', 'Plan', { icon: 'file', component: PlanSelectionComponent });
    _cellsRegister.registerCell('planLink', PlanLinkComponent);
    _viewRegistry.registerView('plans', 'partials/plans/plans.html');
  }
}
