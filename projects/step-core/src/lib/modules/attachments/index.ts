import { AttachmentIsImagePipe } from './pipes/attachment-is-image.pipe';
import { AttachmentIsTextPipe } from './pipes/attachment-is-text.pipe';
import { AttachmentShowLabelPipe } from './pipes/attachment-show-label.pipe';
import { AttachmentUrlPipe } from './pipes/attachment-url.pipe';
import { AttachmentPreviewComponent } from './components/attachment-preview/attachment-preview.component';
import { AttachmentsComponent } from './components/attachments/attachments.component';
import { AttachmentsPreviewComponent } from './components/attachments-preview/attachments-preview.component';

export * from './pipes/attachment-is-image.pipe';
export * from './pipes/attachment-is-text.pipe';
export * from './pipes/attachment-show-label.pipe';
export * from './pipes/attachment-url.pipe';
export * from './components/attachment-preview/attachment-preview.component';
export * from './components/attachments/attachments.component';
export * from './components/attachments-preview/attachments-preview.component';

export const ATTACHMENTS_EXPORTS = [
  AttachmentIsImagePipe,
  AttachmentIsTextPipe,
  AttachmentShowLabelPipe,
  AttachmentUrlPipe,
  AttachmentPreviewComponent,
  AttachmentsComponent,
  AttachmentsPreviewComponent,
];
