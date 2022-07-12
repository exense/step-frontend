import { NgModule } from '@angular/core';
import { StepCommonModule } from '../_common/step-common.module';
import { StepCoreModule } from '@exense/step-core';
import { AgentListComponent } from './components/agent-list/agent-list.component';
import { StatusSummaryComponent } from './components/status-summary/status-summary.component';
import { CalcStatusSummaryProgressbarWithPercentPipe } from './components/status-summary/calc-status-summary-progressbar-with-percent.pipe';

@NgModule({
  declarations: [AgentListComponent, StatusSummaryComponent, CalcStatusSummaryProgressbarWithPercentPipe],
  exports: [AgentListComponent],
  imports: [StepCoreModule, StepCommonModule],
})
export class GridModule {}
