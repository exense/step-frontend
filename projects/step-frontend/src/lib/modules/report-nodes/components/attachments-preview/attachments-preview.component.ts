import { Component, Input, TrackByFunction } from '@angular/core';
import { AttachmentMeta } from '@exense/step-core';

@Component({
  selector: 'step-attachments-preview',
  templateUrl: './attachments-preview.component.html',
  styleUrls: ['./attachments-preview.component.scss'],
})
export class AttachmentsPreviewComponent {
  @Input() attachments?: AttachmentMeta[];
  readonly trackByAttachment: TrackByFunction<AttachmentMeta> = (index, item) => item.id;
}
