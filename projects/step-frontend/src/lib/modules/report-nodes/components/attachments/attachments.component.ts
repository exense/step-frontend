import { Component, inject, Input, TrackByFunction } from '@angular/core';
import { AttachmentMeta, ReportNode } from '@exense/step-core';
import { DOCUMENT } from '@angular/common';
import { AttachmentUrlPipe } from '../../pipes/attachment-url.pipe';

@Component({
  selector: 'step-attachments',
  templateUrl: './attachments.component.html',
  styleUrls: ['./attachments.component.scss'],
})
export class AttachmentsComponent {
  private _doc = inject(DOCUMENT);

  readonly trackByAttachment: TrackByFunction<AttachmentMeta> = (index, item) => item.id;

  @Input() node?: ReportNode;

  openAttachment(attachment: AttachmentMeta): void {
    const url = AttachmentUrlPipe.transform(attachment);
    this._doc!.defaultView!.open(url, '_blank');
  }
}
