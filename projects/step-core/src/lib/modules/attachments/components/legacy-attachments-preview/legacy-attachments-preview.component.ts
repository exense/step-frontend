import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AttachmentMeta } from '../../../../client/step-client-module';
import { LegacyAttachmentPreviewComponent } from '../legacy-attachment-preview/legacy-attachment-preview.component';

@Component({
  selector: 'step-legacy-attachments-preview',
  templateUrl: './legacy-attachments-preview.component.html',
  styleUrls: ['./legacy-attachments-preview.component.scss'],
  imports: [LegacyAttachmentPreviewComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegacyAttachmentsPreviewComponent {
  /** @Input() **/
  readonly attachments = input<AttachmentMeta[] | undefined>(undefined);

  protected readonly hasAttachments = computed(() => !!this.attachments()?.length);
}
