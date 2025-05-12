import { inject, Pipe, PipeTransform } from '@angular/core';
import { AttachmentMeta, AugmentedResourcesService } from '../../../client/step-client-module';

@Pipe({
  name: 'attachmentUrl',
  standalone: true,
})
export class AttachmentUrlPipe implements PipeTransform {
  protected _resourceService = inject(AugmentedResourcesService);

  transform(attachment?: AttachmentMeta, isInline?: boolean): string | undefined {
    if (!attachment?.id) {
      return undefined;
    }
    return this._resourceService.getDownloadResourceUrl(attachment.id!, isInline);
  }
}
