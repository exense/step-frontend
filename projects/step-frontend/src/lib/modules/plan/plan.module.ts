import { NgModule } from '@angular/core';
import { PlanListComponent } from './components/plan-list/plan-list.component';
import { StepCommonModule } from '../_common/step-common.module';
import { PlanOtherplanListComponent } from './components/plan-otherplan-list/plan-otherplan-list.component';
import { PlanFunctionListComponent } from './components/plan-function-list/plan-function-list.component';
import { PlanArtefactListComponent } from './components/plan-artefact-list/plan-artefact-list.component';

@NgModule({
  declarations: [PlanListComponent, PlanOtherplanListComponent, PlanFunctionListComponent, PlanArtefactListComponent],
  imports: [StepCommonModule],
  exports: [PlanListComponent, PlanOtherplanListComponent, PlanFunctionListComponent, PlanArtefactListComponent],
})
export class PlanModule {}
