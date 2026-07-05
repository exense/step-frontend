import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { AttachmentMeta } from '../../../../client/generated';
import { AttachmentPreviewComponent } from '../attachment-preview/attachment-preview.component';
import { AttachmentUtilsService } from '../../injectables/attachment-utils.service';
import { PreviewAttachmentMeta } from '../../types/preview-attachment-meta';
import { AttachmentType } from '../../types/attachment-type.enum';
import { AttachmentPreviewContentService } from '../../injectables/attachment-preview-content.service';

@Component({
  selector: 'step-attachment-preview-list',
  imports: [AttachmentPreviewComponent],
  templateUrl: './attachment-preview-list.component.html',
  styleUrl: './attachment-preview-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttachmentPreviewListComponent {
  private _attachmentUtils = inject(AttachmentUtilsService);
  private _attachmentPreviewContent = inject(AttachmentPreviewContentService);

  readonly attachmentMetas = input([], {
    transform: (value?: AttachmentMeta[]) => value ?? [],
    alias: 'attachments',
  });

  readonly allowedStreamPreviewAmount = input(10);
  readonly allowedTextPreviewAmount = input(10);

  private readonly textPreviewIds = computed(() => {
    const result: string[] = [];
    const allowedAmount = this.allowedTextPreviewAmount();
    for (const item of this.attachmentMetas()) {
      if (result.length >= allowedAmount) {
        break;
      }
      if (!item.id || this._attachmentUtils.determineAttachmentType(item) !== AttachmentType.TEXT) {
        continue;
      }
      result.push(item.id);
    }
    return result;
  });

  private readonly textPreviewById = computed(() => {
    const result: Record<string, string | undefined> = {};
    for (const id of this.textPreviewIds()) {
      result[id] = this._attachmentPreviewContent.getPreviewContent(id)();
    }
    return result;
  });

  private readonly textPreviewRequestEffect = effect(() => {
    this._attachmentPreviewContent.requestTextPreviews(this.textPreviewIds());
  });

  protected readonly attachments = computed(() => {
    const attachmentMetas = this.attachmentMetas();
    let allowedStreamAmount = this.allowedStreamPreviewAmount();
    const textPreviewById = this.textPreviewById();

    const result: PreviewAttachmentMeta[] = [];

    for (const item of attachmentMetas) {
      const type = this._attachmentUtils.determineAttachmentType(item);
      const meta = { ...item } as PreviewAttachmentMeta;
      if (type === AttachmentType.STREAMING_TEXT && allowedStreamAmount > 0) {
        meta.canUseStreamPreview = true;
        allowedStreamAmount--;
      } else if (type === AttachmentType.TEXT && item.id) {
        meta.textPreview = textPreviewById[item.id];
      }
      result.push(meta);
    }

    return result;
  });
}
