import { NgModule } from '@angular/core';
import { StepCommonModule } from '../_common/step-common.module';
import { StepCoreModule } from '@exense/step-core';
import { AgentListComponent } from './components/agent-list/agent-list.component';
import { StatusSummaryComponent } from './components/status-summary/status-summary.component';
import { TokenListComponent } from './components/token-list/token-list.component';

@NgModule({
  declarations: [AgentListComponent, TokenListComponent, StatusSummaryComponent],
  exports: [AgentListComponent, TokenListComponent, StatusSummaryComponent],
  imports: [StepCoreModule, StepCommonModule],
})
export class GridModule {}
