import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AttachmentMeta } from '../../../../client/step-client-module';
import { AttachmentPreviewComponent } from '../attachment-preview/attachment-preview.component';

@Component({
  selector: 'step-attachments-preview',
  templateUrl: './attachments-preview.component.html',
  styleUrls: ['./attachments-preview.component.scss'],
  standalone: true,
  imports: [AttachmentPreviewComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttachmentsPreviewComponent {
  /** @Input() **/
  readonly attachments = input<AttachmentMeta[] | undefined>(undefined);

  protected readonly hasAttachments = computed(() => !!this.attachments()?.length);
}
