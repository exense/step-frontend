import { NgModule } from '@angular/core';
import { StepCommonModule } from '../_common/step-common.module';
import { AttachmentsComponent } from './components/attachments/attachments.component';
import { AttachmentUrlPipe } from './pipes/attachment-url.pipe';
import { ReportNodeErrorComponent } from './components/report-node-error/report-node-error.component';
import { AttachmentIsImagePipe } from './pipes/attachment-is-image.pipe';
import { AttachmentIsTextPipe } from './pipes/attachment-is-text.pipe';
import { AttachmentShowLabelPipe } from './pipes/attachment-show-label.pipe';
import { AttachmentPreviewComponent } from './components/attachment-preview/attachment-preview.component';
import { AttachmentsPreviewComponent } from './components/attachments-preview/attachments-preview.component';
import { ReportNodeShortComponent } from './components/report-node-short/report-node-short.component';
import { ReportNodeComponent } from './components/report-node/report-node.component';
import { RetryIfFailComponent } from './components/retry-if-fail/retry-if-fail.component';
import { WaitForEventComponent } from './components/wait-for-event/wait-for-event.component';
import { CallFunctionReportNodeComponent } from './components/call-function-report-node/call-function-report-node.component';
import { CallFunctionReportNodeExternalLinkPipe } from './pipes/call-function-report-node-external-link.pipe';

@NgModule({
  declarations: [
    AttachmentsComponent,
    AttachmentUrlPipe,
    ReportNodeErrorComponent,
    AttachmentIsImagePipe,
    AttachmentIsTextPipe,
    AttachmentShowLabelPipe,
    AttachmentPreviewComponent,
    AttachmentsPreviewComponent,
    ReportNodeShortComponent,
    ReportNodeComponent,
    RetryIfFailComponent,
    WaitForEventComponent,
    CallFunctionReportNodeComponent,
    CallFunctionReportNodeExternalLinkPipe,
  ],
  imports: [StepCommonModule],
  exports: [
    ReportNodeShortComponent,
    ReportNodeComponent,
    ReportNodeErrorComponent,
    AttachmentPreviewComponent,
    AttachmentsPreviewComponent,
    CallFunctionReportNodeComponent,
  ],
})
export class ReportNodesModule {}
