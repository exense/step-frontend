import { inject, Injectable } from '@angular/core';
import { AttachmentMeta, AugmentedResourcesService, StreamingAttachmentMeta } from '../../../client/step-client-module';
import { AttachmentType } from '../types/attachment-type.enum';
import {
  IMAGE_TYPES,
  ImageType,
  SpecialMimeType,
  TEXT_TYPES,
  TextType,
  VIDEO_TYPES,
  VideoType,
} from '../../basics/step-basics.module';
import { AugmentedStreamingResourcesService } from '../../../client/augmented/services/augmented-streaming-resources.service';

const SKIPPED_ATTACHMENT_META = 'step.attachments.SkippedAttachmentMeta';
const STREAMING_ATTACHMENT_META = 'step.attachments.StreamingAttachmentMeta';

@Injectable({
  providedIn: 'root',
})
export class AttachmentUtilsService {
  private _resourceService = inject(AugmentedResourcesService);
  private _streamingResourceService = inject(AugmentedStreamingResourcesService);
  private _imageTypes = inject(IMAGE_TYPES);
  private _textTypes = inject(TEXT_TYPES);
  private _videoTypes = inject(VIDEO_TYPES);

  determineAttachmentType(attachment?: AttachmentMeta): AttachmentType {
    if (!attachment) {
      return AttachmentType.SKIPPED;
    }

    if (attachment.type === SKIPPED_ATTACHMENT_META) {
      return AttachmentType.SKIPPED;
    }

    if (attachment.mimeType === SpecialMimeType.PLAYWRIGHT_TRACE) {
      return AttachmentType.TRACE;
    }

    const isStreaming = attachment.type === STREAMING_ATTACHMENT_META;
    if (isStreaming) {
      const streamingMeta = attachment as StreamingAttachmentMeta;
      if (streamingMeta.currentNumberOfLines === null || streamingMeta.currentNumberOfLines === undefined) {
        return AttachmentType.STREAMING_BINARY;
      }
    }

    const nameParts = (attachment.name ?? '').split('.');
    const extension = nameParts[nameParts.length - 1];
    if (!extension) {
      return AttachmentType.DEFAULT;
    }

    if (this._imageTypes.has(extension as ImageType)) {
      return AttachmentType.IMG;
    }

    if (this._videoTypes.has(extension as VideoType)) {
      return AttachmentType.VIDEO;
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
      case AttachmentType.TRACE:
        return 'playwright';
      case AttachmentType.STREAMING_BINARY:
        return 'binary-file';
      default:
        return 'paperclip';
    }
  }

  downloadAttachment(attachment?: AttachmentMeta): void {
    if (!attachment) {
      return;
    }
    if (attachment.type === STREAMING_ATTACHMENT_META) {
      this._streamingResourceService.downloadResource(attachment.id!, attachment.name!);
    } else {
      this._resourceService.downloadResource(attachment.id!, attachment.name!);
    }
  }

  getAttachmentStreamingUrl(attachmentOrId?: string | AttachmentMeta): string | undefined {
    if (!attachmentOrId) {
      return undefined;
    }
    const id = typeof attachmentOrId === 'string' ? attachmentOrId : attachmentOrId.id;
    return `/streaming/download/${id}`;
  }
}
