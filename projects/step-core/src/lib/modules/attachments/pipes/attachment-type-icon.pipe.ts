import { inject, Pipe, PipeTransform } from '@angular/core';
import { AttachmentType } from '../types/attachment-type.enum';
import { AttachmentUtilsService } from '../injectables/attachment-utils.service';

@Pipe({
  name: 'attachmentTypeIcon',
  standalone: true,
})
export class AttachmentTypeIconPipe implements PipeTransform {
  private _utils = inject(AttachmentUtilsService);

  transform(value: AttachmentType): string {
    return this._utils.determineAttachmentTypeIcon(value);
  }
}
