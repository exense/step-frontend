import { inject, Pipe, PipeTransform } from '@angular/core';
import { AttachmentMeta } from '../../../client/step-client-module';
import { AttachmentUtilsService } from '../injectables/attachment-utils.service';
import { AttachmentType } from '../types/attachment-type.enum';

@Pipe({
  name: 'attachmentUrl',
})
export class AttachmentUrlPipe implements PipeTransform {
  private _attachmentUtils = inject(AttachmentUtilsService);

  transform(attachment?: AttachmentMeta, isInline?: boolean): string | undefined {
    if (!attachment?.id || this._attachmentUtils.determineAttachmentType(attachment) === AttachmentType.SKIPPED) {
      return undefined;
    }
    return this._attachmentUtils.getDownloadAttachmentUrl(attachment, isInline);
  }
}
