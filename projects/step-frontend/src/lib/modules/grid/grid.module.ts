import { NgModule } from '@angular/core';
import { StepCommonModule } from '../_common/step-common.module';
import { StepCoreModule } from '@exense/step-core';
import { AgentListComponent } from './components/agent-list/agent-list.component';
import { StatusSummaryComponent } from './components/status-summary/status-summary.component';

@NgModule({
  declarations: [AgentListComponent, StatusSummaryComponent],
  exports: [AgentListComponent, StatusSummaryComponent],
  imports: [StepCoreModule, StepCommonModule],
})
export class GridModule {}
