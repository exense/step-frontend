import { inject, Injectable } from '@angular/core';
import { AttachmentMeta, AugmentedResourcesService } from '../../../client/step-client-module';
import { AttachmentType } from '../types/attachment-type.enum';
import { IMAGE_TYPES, ImageType, TEXT_TYPES, TextType, VIDEO_TYPES, VideoType } from '../../basics/step-basics.module';

@Injectable({
  providedIn: 'root',
})
export class AttachmentUtilsService {
  private _resourceService = inject(AugmentedResourcesService);
  private _imageTypes = inject(IMAGE_TYPES);
  private _textTypes = inject(TEXT_TYPES);
  private _videoTypes = inject(VIDEO_TYPES);

  determineAttachmentType(attachment?: AttachmentMeta): AttachmentType {
    if (!attachment) {
      return AttachmentType.SKIPPED;
    }

    if (attachment.type === 'step.attachments.SkippedAttachmentMeta') {
      return AttachmentType.SKIPPED;
    }

    const isStreaming = attachment.type === 'step.attachments.StreamingAttachmentMeta';

    const nameParts = (attachment.name ?? '').split('.');
    const extension = nameParts[nameParts.length - 1];
    if (!extension) {
      return AttachmentType.DEFAULT;
    }

    if (this._imageTypes.has(extension as ImageType)) {
      return AttachmentType.IMG;
    }

    if (this._videoTypes.has(extension as VideoType)) {
      return isStreaming ? AttachmentType.STREAMING_VIDEO : AttachmentType.VIDEO;
    }

    if (this._textTypes.has(extension as TextType)) {
      return isStreaming ? AttachmentType.STREAMING_TEXT : AttachmentType.TEXT;
    }

    return AttachmentType.DEFAULT;
  }

  determineAttachmentTypeIcon(attachmentType: AttachmentType): string {
    switch (attachmentType) {
      case AttachmentType.TEXT:
        return 'file';
      case AttachmentType.IMG:
        return 'image';
      case AttachmentType.VIDEO:
        return 'film';
      case AttachmentType.SKIPPED:
        return 'alert-circle';
      default:
        return 'paperclip';
    }
  }

  downloadAttachment(attachment?: AttachmentMeta): void {
    if (!attachment) {
      return;
    }
    this._resourceService.downloadResource(attachment.id!, attachment.name!);
  }
}
