import { NgModule } from '@angular/core';
import {
  CustomCellRegistryService,
  EntityRegistry,
  PlanDialogsService,
  PlanLinkComponent,
  PlanLinkDialogService,
  SimpleOutletComponent,
  ViewRegistryService,
} from '@exense/step-core';
import { ExecutionModule } from '../execution/execution.module';
import { StepCommonModule } from '../_common/step-common.module';
import { PlanListComponent } from './components/plan-list/plan-list.component';
import { PlanEditorModule } from '../plan-editor/plan-editor.module';
import { PlanEditorComponent } from './components/plan-editor/plan-editor.component';
import { PlanSelectionComponent } from './components/plan-selection/plan-selection.component';
import { PlansBulkOperationsRegisterService } from './injectables/plans-bulk-operations-register.service';

@NgModule({
  declarations: [PlanListComponent, PlanEditorComponent, PlanSelectionComponent],
  imports: [StepCommonModule, ExecutionModule, PlanEditorModule],
  exports: [PlanEditorModule, PlanListComponent, PlanEditorComponent, PlanSelectionComponent],
  providers: [
    {
      provide: PlanLinkDialogService,
      useExisting: PlanDialogsService,
    },
  ],
})
export class PlanModule {
  constructor(
    _entityRegistry: EntityRegistry,
    _planBulkOperations: PlansBulkOperationsRegisterService,
    _cellsRegister: CustomCellRegistryService,
    _viewRegistry: ViewRegistryService
  ) {
    _planBulkOperations.register();
    _entityRegistry.register('plans', 'Plan', { icon: 'plan', component: PlanSelectionComponent });
    _cellsRegister.registerCell('planLink', PlanLinkComponent);
    _viewRegistry.registerRoute({
      path: 'plans',
      component: SimpleOutletComponent,
      children: [
        {
          path: '',
          redirectTo: 'list',
        },
        {
          path: 'list',
          component: PlanListComponent,
        },
        {
          path: 'editor/:id',
          component: PlanEditorComponent,
        },
      ],
    });
  }
}
