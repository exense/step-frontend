import { AttachmentIsImagePipe } from './pipes/attachment-is-image.pipe';
import { AttachmentIsTextPipe } from './pipes/attachment-is-text.pipe';
import { AttachmentShowLabelPipe } from './pipes/attachment-show-label.pipe';
import { AttachmentUrlPipe } from './pipes/attachment-url.pipe';
import { LegacyAttachmentPreviewComponent } from './components/legacy-attachment-preview/legacy-attachment-preview.component';
import { LegacyAttachmentsComponent } from './components/legacy-attachments/legacy-attachments.component';
import { LegacyAttachmentsPreviewComponent } from './components/legacy-attachments-preview/legacy-attachments-preview.component';
import { AttachmentPreviewComponent } from './components/attachment-preview/attachment-preview.component';
import { AttachmentPreviewListComponent } from './components/attachment-preview-list/attachment-preview-list.component';
import { AttachmentDialogComponent } from './components/attachment-dialog/attachment-dialog.component';
import { AttachmentTypePipe } from './pipes/attachment-type.pipe';
import { AttachmentTypeIconPipe } from './pipes/attachment-type-icon.pipe';
import { StreamingTextComponent } from './components/streaming-text/streaming-text.component';
import { StreamingAttachmentIndicatorComponent } from './components/streaming-attachment-indicator/streaming-attachment-indicator.component';
import { AttachmentInlinePreviewListComponent } from './components/attachment-inline-preview-list/attachment-inline-preview-list.component';

export * from './pipes/attachment-is-image.pipe';
export * from './pipes/attachment-is-text.pipe';
export * from './pipes/attachment-show-label.pipe';
export * from './pipes/attachment-url.pipe';
export * from './pipes/attachment-type.pipe';
export * from './pipes/attachment-type-icon.pipe';
export * from './components/legacy-attachment-preview/legacy-attachment-preview.component';
export * from './components/legacy-attachments/legacy-attachments.component';
export * from './components/legacy-attachments-preview/legacy-attachments-preview.component';
export * from './components/attachment-preview/attachment-preview.component';
export * from './components/attachment-preview-list/attachment-preview-list.component';
export * from './components/attachment-dialog/attachment-dialog.component';
export * from './injectables/attachment-utils.service';
export * from './components/streaming-text/streaming-text.component';
export * from './components/streaming-attachment-indicator/streaming-attachment-indicator.component';
export * from './components/attachment-inline-preview-list/attachment-inline-preview-list.component';
export * from './types/attachment-type.enum';
export * from './injectables/attachment-dialogs.service';
export * from './directives/streaming-attachment-status.directive';

export const ATTACHMENTS_EXPORTS = [
  AttachmentIsImagePipe,
  AttachmentIsTextPipe,
  AttachmentShowLabelPipe,
  AttachmentUrlPipe,
  LegacyAttachmentPreviewComponent,
  LegacyAttachmentsComponent,
  LegacyAttachmentsPreviewComponent,
  AttachmentPreviewComponent,
  AttachmentPreviewListComponent,
  AttachmentInlinePreviewListComponent,
  AttachmentDialogComponent,
  AttachmentTypePipe,
  AttachmentTypeIconPipe,
  StreamingTextComponent,
  StreamingAttachmentIndicatorComponent,
];
