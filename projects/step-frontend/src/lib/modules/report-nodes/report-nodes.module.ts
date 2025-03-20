import { NgModule } from '@angular/core';
import { StepCommonModule } from '../_common/step-common.module';
import { ReportNodeShortComponent } from './components/report-node-short/report-node-short.component';
import { ReportNodeComponent } from './components/report-node/report-node.component';
import { RetryIfFailComponent } from './components/retry-if-fail/retry-if-fail.component';
import { WaitForEventComponent } from './components/wait-for-event/wait-for-event.component';
import { CallFunctionReportNodeComponent } from './components/call-function-report-node/call-function-report-node.component';
import { CallFunctionReportNodeExternalLinkPipe } from './pipes/call-function-report-node-external-link.pipe';

@NgModule({
  declarations: [
    ReportNodeShortComponent,
    ReportNodeComponent,
    RetryIfFailComponent,
    WaitForEventComponent,
    CallFunctionReportNodeComponent,
    CallFunctionReportNodeExternalLinkPipe,
  ],
  imports: [StepCommonModule],
  exports: [ReportNodeShortComponent, ReportNodeComponent, CallFunctionReportNodeComponent],
})
export class ReportNodesModule {}
