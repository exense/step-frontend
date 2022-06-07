import { NgModule } from '@angular/core';
import { ExecutionListComponent } from './components/execution-list/execution-list.component';
import { StepCommonModule } from '../_common/step-common.module';
import { StatusComponent } from './components/status/status.component';
import { StatusDistributionComponent } from './components/status-distribution/status-distribution.component';
import { ExecutionResultComponent } from './components/execution-result/execution-result.component';

@NgModule({
  declarations: [ExecutionListComponent, StatusComponent, StatusDistributionComponent, ExecutionResultComponent],
  imports: [StepCommonModule],
  exports: [ExecutionListComponent],
})
export class ExecutionModule {}
