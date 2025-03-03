import { Pipe, PipeTransform } from '@angular/core';
import { AttachmentMeta } from '@exense/step-core';

@Pipe({
  name: 'attachmentIsImage',
  standalone: true,
})
export class AttachmentIsImagePipe implements PipeTransform {
  transform(attachment?: AttachmentMeta): boolean {
    return AttachmentIsImagePipe.transform(attachment);
  }

  static transform(attachment?: AttachmentMeta): boolean {
    const name = attachment?.name || '';
    return name.endsWith('.jpg') || name.endsWith('.png');
  }
}
