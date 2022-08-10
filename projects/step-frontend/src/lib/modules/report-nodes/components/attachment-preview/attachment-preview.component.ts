import { Component, Input } from '@angular/core';
import { AttachmentMeta } from '@exense/step-core';

@Component({
  selector: 'step-attachment-preview',
  templateUrl: './attachment-preview.component.html',
  styleUrls: ['./attachment-preview.component.scss'],
})
export class AttachmentPreviewComponent {
  @Input() attachment?: AttachmentMeta;
}
