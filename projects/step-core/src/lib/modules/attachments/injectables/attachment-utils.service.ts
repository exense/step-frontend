import { inject, Injectable } from '@angular/core';
import { AttachmentMeta, AugmentedResourcesService } from '../../../client/step-client-module';
import { AttachmentType } from '../types/attachment-type.enum';
import { AttachmentIsImagePipe } from '../pipes/attachment-is-image.pipe';
import { AttachmentIsTextPipe } from '../pipes/attachment-is-text.pipe';

@Injectable({
  providedIn: 'root',
})
export class AttachmentUtilsService {
  private _resourceService = inject(AugmentedResourcesService);

  determineAttachmentType(attachment?: AttachmentMeta): AttachmentType {
    if (!attachment) {
      return AttachmentType.DEFAULT;
    }
    if (AttachmentIsImagePipe.transform(attachment)) {
      return AttachmentType.IMG;
    }
    if (AttachmentIsTextPipe.transform(attachment)) {
      return AttachmentType.TEXT;
    }
    return AttachmentType.DEFAULT;
  }

  downloadAttachment(attachment?: AttachmentMeta): void {
    if (!attachment) {
      return;
    }
    this._resourceService.downloadResource(attachment.id!, attachment.name!);
  }
}
