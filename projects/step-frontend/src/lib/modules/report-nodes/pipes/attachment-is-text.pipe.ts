import { Pipe, PipeTransform } from '@angular/core';
import { AttachmentMeta } from '@exense/step-core';

@Pipe({
  name: 'attachmentIsText',
})
export class AttachmentIsTextPipe implements PipeTransform {
  transform(attachment?: AttachmentMeta): boolean {
    return AttachmentIsTextPipe.transform(attachment);
  }

  static transform(attachment?: AttachmentMeta): boolean {
    const name = attachment?.name || '';
    return name.endsWith('.log') || name.endsWith('.txt');
  }
}
