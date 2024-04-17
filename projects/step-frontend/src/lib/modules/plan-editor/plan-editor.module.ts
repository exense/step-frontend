import { NgModule } from '@angular/core';
import { PlanTypeRegistryService } from '@exense/step-core';
import { StepCommonModule } from '../_common/step-common.module';
import { ExecutionModule } from '../execution/execution.module';
import { PlanEditorBaseComponent } from './components/plan-editor-base/plan-editor-base.component';
import { PlanArtefactListComponent } from './components/plan-artefact-list/plan-artefact-list.component';
import { PlanFunctionListComponent } from './components/plan-function-list/plan-function-list.component';
import { PlanOtherplanListComponent } from './components/plan-otherplan-list/plan-otherplan-list.component';
import { PlanEditorActionsComponent } from './components/plan-editor-actions/plan-editor-actions.component';
import { PlanCommonTreeEditorFormComponent } from './components/plan-common-tree-editor-form/plan-common-tree-editor-form.component';
import { PlanEditorKeyHandlerDirective } from './directives/plan-editor-key-handler.directive';
import { PlanAlertsComponent } from './components/plan-alerts/plan-alerts.component';
import { PlanSourceDialogComponent } from './components/plan-source-dialog/plan-source-dialog.component';
import { PlanEditorAttributesDirective } from './directives/plan-editor-attributes.directive';
import { EntitySelectionControlComponent } from './components/entity-selection-control/entity-selection-control.component';

@NgModule({
  declarations: [
    PlanEditorBaseComponent,
    PlanArtefactListComponent,
    PlanFunctionListComponent,
    PlanOtherplanListComponent,
    PlanEditorActionsComponent,
    PlanCommonTreeEditorFormComponent,
    PlanEditorKeyHandlerDirective,
    PlanAlertsComponent,
    PlanSourceDialogComponent,
    PlanEditorAttributesDirective,
    EntitySelectionControlComponent,
  ],
  imports: [StepCommonModule, ExecutionModule],
  exports: [
    PlanEditorBaseComponent,
    PlanCommonTreeEditorFormComponent,
    PlanEditorKeyHandlerDirective,
    PlanSourceDialogComponent,
    PlanEditorAttributesDirective,
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
