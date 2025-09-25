import { inject, Pipe, PipeTransform } from '@angular/core';
import { AttachmentMeta } from '../../../client/step-client-module';
import { AttachmentUtilsService } from '../injectables/attachment-utils.service';

@Pipe({
  name: 'attachmentUrl',
})
export class AttachmentUrlPipe implements PipeTransform {
  private _attachmentUtils = inject(AttachmentUtilsService);

  transform(attachment?: AttachmentMeta, isInline?: boolean): string | undefined {
    if (!attachment) {
      return undefined;
    }
    return this._attachmentUtils.getDownloadAttachmentUrl(attachment, isInline);
  }
}
