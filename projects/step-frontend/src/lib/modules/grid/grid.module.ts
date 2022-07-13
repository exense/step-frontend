import { NgModule } from '@angular/core';
import { StepCommonModule } from '../_common/step-common.module';
import { StepCoreModule } from '@exense/step-core';
import { AgentListComponent } from './components/agent-list/agent-list.component';
import { StatusSummaryComponent } from './components/status-summary/status-summary.component';
import { TokenListComponent } from './components/token-list/token-list.component';
import { CalcStatusSummaryProgressbarWithPercentPipe } from './components/status-summary/calc-status-summary-progressbar-with-percent.pipe';

@NgModule({
  declarations: [
    AgentListComponent,
    TokenListComponent,
    StatusSummaryComponent,
    CalcStatusSummaryProgressbarWithPercentPipe,
  ],
  exports: [AgentListComponent, TokenListComponent, StatusSummaryComponent],
  imports: [StepCoreModule, StepCommonModule],
})
export class GridModule {}
