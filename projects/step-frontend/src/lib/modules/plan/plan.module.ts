import { NgModule } from '@angular/core';
import { PlanListComponent } from './components/plan-list/plan-list.component';
import { StepCommonModule } from '../_common/step-common.module';

@NgModule({
  declarations: [PlanListComponent],
  imports: [StepCommonModule],
  exports: [PlanListComponent],
})
export class PlanModule {}
