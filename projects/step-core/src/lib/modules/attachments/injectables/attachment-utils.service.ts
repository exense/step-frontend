import { inject, Injectable } from '@angular/core';
import { AttachmentMeta, AugmentedResourcesService, StreamingAttachmentMeta } from '../../../client/step-client-module';
import { AttachmentType } from '../types/attachment-type.enum';
import { FILE_TYPES, FileTypeUtilsService, TypeInfoCategory } from '../../basics/step-basics.module';
import { AugmentedStreamingResourcesService } from '../../../client/augmented/services/augmented-streaming-resources.service';

const SKIPPED_ATTACHMENT_META = 'step.attachments.SkippedAttachmentMeta';
const STREAMING_ATTACHMENT_META = 'step.attachments.StreamingAttachmentMeta';

@Injectable({
  providedIn: 'root',
})
export class AttachmentUtilsService {
  private _resourceService = inject(AugmentedResourcesService);
  private _streamingResourceService = inject(AugmentedStreamingResourcesService);
  private _fileTypeUtils = inject(FileTypeUtilsService);

  determineAttachmentType(attachment?: AttachmentMeta): AttachmentType {
    if (!attachment) {
      return AttachmentType.SKIPPED;
    }

    if (attachment.type === SKIPPED_ATTACHMENT_META) {
      return AttachmentType.SKIPPED;
    }

    if (attachment.type === STREAMING_ATTACHMENT_META && !this.hasLines(attachment)) {
      return AttachmentType.STREAMING_BINARY;
    }

    const typeCategory = this._fileTypeUtils.checkTypeCategory(attachment.mimeType);
    let result = this.determineAttachmentTypes(typeCategory, attachment.mimeType);
    if (result !== undefined && result !== AttachmentType.TEXT) {
      return result;
    }

    // Type is unknown or text
    if (this.hasLines(attachment)) {
      // If meta has lines - it's streaming text
      return AttachmentType.STREAMING_TEXT;
    }

    if (!!result) {
      // Type is simple text
      return result;
    }

    // Type is unknown and definitely not a streaming text.
    // Make an attempt to determine attachment type by the extension
    const nameParts = (attachment.name ?? '').split('.');
    const extension = nameParts[nameParts.length - 1];

    const typeInfo = this._fileTypeUtils.findByExtension(extension);
    result = this.determineAttachmentTypes(typeInfo?.category, typeInfo?.mimeType);
    if (result !== undefined) {
      return result;
    }

    // Type hasn't been determined by mimeType or extension
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

  private determineAttachmentTypes(typeCategory?: TypeInfoCategory, mimeType?: string): AttachmentType | undefined {
    if (typeCategory === TypeInfoCategory.IMAGE) {
      return AttachmentType.IMG;
    }
    if (typeCategory === TypeInfoCategory.VIDEO) {
      return AttachmentType.VIDEO;
    }
    if (typeCategory === TypeInfoCategory.OTHER) {
      if (mimeType === FILE_TYPES.PLAYWRIGHT_TRACE.mimeType) {
        return AttachmentType.TRACE;
      } else {
        return AttachmentType.DEFAULT;
      }
    }
    if (typeCategory === TypeInfoCategory.TEXT) {
      return AttachmentType.TEXT;
    }
    return undefined;
  }

  private hasLines(meta: AttachmentMeta): boolean {
    const streamingMeta = meta as StreamingAttachmentMeta;
    return streamingMeta.currentNumberOfLines !== undefined && streamingMeta.currentNumberOfLines !== null;
  }
}
