import { NgModule } from '@angular/core';
import { StepCoreModule } from '@exense/step-core';
import { PlanListComponent } from './components/plan-list/plan-list.component';
import { StepCommonModule } from '../_common/step-common.module';

@NgModule({
  declarations: [PlanListComponent],
  imports: [StepCommonModule, StepCoreModule],
  exports: [PlanListComponent],
})
export class PlanModule {}
