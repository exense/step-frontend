import { Pipe, PipeTransform } from '@angular/core';
import { AttachmentMeta } from '@exense/step-core';
import { AttachmentIsTextPipe } from './attachment-is-text.pipe';

@Pipe({
  name: 'attachmentShowLabel',
  standalone: true,
})
export class AttachmentShowLabelPipe implements PipeTransform {
  transform(attachment?: AttachmentMeta): boolean {
    return AttachmentShowLabelPipe.transform(attachment);
  }

  static transform(attachment?: AttachmentMeta): boolean {
    const name = attachment?.name || '';
    return AttachmentIsTextPipe.transform(attachment) || !name.startsWith('screenshot.');
  }
}
