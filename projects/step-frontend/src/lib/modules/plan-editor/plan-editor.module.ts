import { NgModule } from '@angular/core';
import { StepCommonModule } from '../_common/step-common.module';
import { ExecutionModule } from '../execution/execution.module';
import { PlanEditorComponent } from './components/plan-editor/plan-editor.component';
import { PlanArtefactListComponent } from './components/plan-artefact-list/plan-artefact-list.component';
import { PlanFunctionListComponent } from './components/plan-function-list/plan-function-list.component';
import { PlanOtherplanListComponent } from './components/plan-otherplan-list/plan-otherplan-list.component';
import { PlanEditorActionsComponent } from './components/plan-editor-actions/plan-editor-actions.component';

@NgModule({
  declarations: [
    PlanEditorComponent,
    PlanArtefactListComponent,
    PlanFunctionListComponent,
    PlanOtherplanListComponent,
    PlanEditorActionsComponent,
  ],
  imports: [StepCommonModule, ExecutionModule],
  exports: [PlanEditorComponent],
})
export class PlanEditorModule {}

export * from './injectables/artefact.service';
export * from './injectables/artefact-tree-node-utils.service';
export * from './injectables/interactive-session.service';
export * from './injectables/plan-history.service';
