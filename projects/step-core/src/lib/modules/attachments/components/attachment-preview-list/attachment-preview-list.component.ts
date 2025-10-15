import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { AttachmentMeta } from '../../../../client/generated';
import { AttachmentPreviewComponent } from '../attachment-preview/attachment-preview.component';
import { AttachmentUtilsService } from '../../injectables/attachment-utils.service';
import { PreviewAttachmentMeta } from '../../types/preview-attachment-meta';
import { AttachmentType } from '../../types/attachment-type.enum';

@Component({
  selector: 'step-attachment-preview-list',
  imports: [AttachmentPreviewComponent],
  templateUrl: './attachment-preview-list.component.html',
  styleUrl: './attachment-preview-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttachmentPreviewListComponent {
  private _attachmentUtils = inject(AttachmentUtilsService);

  readonly attachmentMetas = input([], {
    transform: (value?: AttachmentMeta[]) => value ?? [],
    alias: 'attachments',
  });

  readonly allowedStreamPreviewAmount = input(10);

  protected readonly attachments = computed(() => {
    const attachmentMetas = this.attachmentMetas();
    let allowedStreamAmount = this.allowedStreamPreviewAmount();

    const result: PreviewAttachmentMeta[] = [];

    for (const item of attachmentMetas) {
      const type = this._attachmentUtils.determineAttachmentType(item);
      const meta = { ...item } as PreviewAttachmentMeta;
      if (type === AttachmentType.STREAMING_TEXT && allowedStreamAmount > 0) {
        meta.canUseStreamPreview = true;
        allowedStreamAmount--;
      }
      result.push(meta);
    }

    return result;
  });
}
