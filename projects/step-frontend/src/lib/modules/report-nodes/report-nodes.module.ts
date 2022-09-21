import { NgModule } from '@angular/core';
import { StepCommonModule } from '../_common/step-common.module';
import { ReportNodeIconComponent } from './components/report-node-icon/report-node-icon.component';
import { ReportNodeStatusComponent } from './components/report-node-status/report-node-status.component';
import { AttachmentsComponent } from './components/attachments/attachments.component';
import { AttachmentUrlPipe } from './pipes/attachment-url.pipe';
import { AssertReportNodeShortComponent } from './components/assert-report-node-short/assert-report-node-short.component';
import { AttachmentIsImagePipe } from './pipes/attachment-is-image.pipe';
import { AttachmentIsTextPipe } from './pipes/attachment-is-text.pipe';
import { AttachmentShowLabelPipe } from './pipes/attachment-show-label.pipe';
import { AttachmentPreviewComponent } from './components/attachment-preview/attachment-preview.component';
import { AttachmentsPreviewComponent } from './components/attachments-preview/attachments-preview.component';
import { ReportNodeDirective } from './directives/report-node.directive';
import { ReportNodeShortComponent } from './components/report-node-short/report-node-short.component';

@NgModule({
  declarations: [
    ReportNodeIconComponent,
    ReportNodeStatusComponent,
    AttachmentsComponent,
    AttachmentUrlPipe,
    AssertReportNodeShortComponent,
    AttachmentIsImagePipe,
    AttachmentIsTextPipe,
    AttachmentShowLabelPipe,
    AttachmentPreviewComponent,
    AttachmentsPreviewComponent,
    ReportNodeDirective,
    ReportNodeShortComponent,
  ],
  imports: [StepCommonModule],
  exports: [ReportNodeShortComponent, ReportNodeStatusComponent, ReportNodeIconComponent],
})
export class ReportNodesModule {}
