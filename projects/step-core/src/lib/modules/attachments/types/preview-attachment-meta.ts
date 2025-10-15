import { AttachmentMeta, StreamingAttachmentMeta } from '../../../client/step-client-module';

export type PreviewAttachmentMeta = (AttachmentMeta | StreamingAttachmentMeta) & { canUseStreamPreview?: boolean };
