import { inject, Pipe, PipeTransform } from '@angular/core';
import { AttachmentMeta } from '../../../client/step-client-module';
import { AttachmentType } from '../types/attachment-type.enum';
import { AttachmentUtilsService } from '../injectables/attachment-utils.service';

@Pipe({
  name: 'attachmentType',
  standalone: true,
})
export class AttachmentTypePipe implements PipeTransform {
  private _utils = inject(AttachmentUtilsService);

  transform(value?: AttachmentMeta): AttachmentType {
    return this._utils.determineAttachmentType(value);
  }
}
