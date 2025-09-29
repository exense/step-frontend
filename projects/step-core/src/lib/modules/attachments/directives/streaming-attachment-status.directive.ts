import { computed, Directive, inject, input } from '@angular/core';
import { AttachmentUtilsService } from '../injectables/attachment-utils.service';
import { AttachmentMeta, StreamingAttachmentMeta } from '../../../client/step-client-module';
import { AttachmentType } from '../types/attachment-type.enum';

@Directive({
  selector: '[stepStreamingAttachmentStatus]',
})
export class StreamingAttachmentStatusDirective {
  private _attachmentUtils = inject(AttachmentUtilsService);

  readonly attachment = input<AttachmentMeta | undefined>(undefined);

  private streamingAttachment = computed(() => {
    const attachment = this.attachment();
    const attachmentType = this._attachmentUtils.determineAttachmentType(attachment);
    if (attachmentType !== AttachmentType.STREAMING_TEXT && attachmentType !== AttachmentType.STREAMING_BINARY) {
      return undefined;
    }
    return attachment as StreamingAttachmentMeta;
  });

  readonly status = computed(() => {
    const streamingAttachment = this.streamingAttachment();
    return streamingAttachment?.status;
  });
}
