import { Pipe, PipeTransform } from '@angular/core';
import { AttachmentMeta } from '../../../client/step-client-module';

@Pipe({
  name: 'attachmentUrl',
  standalone: true,
})
export class AttachmentUrlPipe implements PipeTransform {
  transform(attachment?: AttachmentMeta, isInline?: boolean): string | undefined {
    return AttachmentUrlPipe.transform(attachment, isInline);
  }

  static transform(attachment?: AttachmentMeta, isInline: boolean = false): string | undefined {
    if (!attachment?.id) {
      return undefined;
    }
    let result = `rest/resources/${attachment!.id!}/content`;
    if (isInline) {
      result = `${result}?inline=true`;
    }
    return result;
  }
}
