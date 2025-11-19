import { NgModule } from '@angular/core';
import { PlanTypeRegistryService } from '@exense/step-core';
import { StepCommonModule } from '../_common/step-common.module';
import { ExecutionModule } from '../execution/execution.module';
import { PlanEditorBaseComponent } from './components/plan-editor-base/plan-editor-base.component';
import { PlanEditorActionsComponent } from './components/plan-editor-actions/plan-editor-actions.component';
import { PlanCommonTreeEditorFormComponent } from './components/plan-common-tree-editor-form/plan-common-tree-editor-form.component';
import { PlanEditorKeyHandlerDirective } from './directives/plan-editor-key-handler.directive';
import { PlanAlertsComponent } from './components/plan-alerts/plan-alerts.component';
import { PlanSourceDialogComponent } from './components/plan-source-dialog/plan-source-dialog.component';
import { PlanNodesDragPreviewComponent } from './components/plan-nodes-drag-preview/plan-nodes-drag-preview.component';
import { PlanControlsComponent } from './components/plan-controls/plan-controls.component';

@NgModule({
  declarations: [
    PlanEditorBaseComponent,
    PlanEditorActionsComponent,
    PlanCommonTreeEditorFormComponent,
    PlanEditorKeyHandlerDirective,
    PlanAlertsComponent,
    PlanSourceDialogComponent,
  ],
  imports: [StepCommonModule, ExecutionModule, PlanNodesDragPreviewComponent, PlanControlsComponent],
  exports: [
    PlanEditorBaseComponent,
    PlanCommonTreeEditorFormComponent,
    PlanEditorKeyHandlerDirective,
    PlanSourceDialogComponent,
  ],
})
export class PlanEditorModule {
  constructor(_planTypeRegistry: PlanTypeRegistryService) {
    _planTypeRegistry.register('step.core.plans.Plan', 'Visual plan editor', PlanCommonTreeEditorFormComponent);
  }
}

export * from './injectables/artefact-tree-node-utils.service';
export * from './injectables/interactive-session.service';
export * from './injectables/plan-history.service';
