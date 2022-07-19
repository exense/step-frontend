import { NgModule } from '@angular/core';
import { PlanListComponent } from './components/plan-list/plan-list.component';
import { StepCommonModule } from '../_common/step-common.module';
import { OtherPlanListComponent } from './components/other-plan-list/other-plan-list.component';

@NgModule({
  declarations: [PlanListComponent, OtherPlanListComponent],
  imports: [StepCommonModule],
  exports: [PlanListComponent, OtherPlanListComponent],
})
export class PlanModule {}
