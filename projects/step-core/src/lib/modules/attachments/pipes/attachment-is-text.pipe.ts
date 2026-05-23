import { Pipe, PipeTransform } from '@angular/core';
import { AttachmentMeta } from '../../../client/step-client-module';

const TEXT_ATTACHMENT_EXTENSIONS = ['.htm', '.html', '.log', '.txt', '.xml'];

@Pipe({
  name: 'attachmentIsText',
})
export class AttachmentIsTextPipe implements PipeTransform {
  transform(attachment?: AttachmentMeta): boolean {
    return AttachmentIsTextPipe.transform(attachment);
  }

  static transform(attachment?: AttachmentMeta): boolean {
    const name = attachment?.name?.toLowerCase() || '';
    return TEXT_ATTACHMENT_EXTENSIONS.some((extension) => name.endsWith(extension));
  }
}
