import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AttachmentMeta } from '../../../../client/generated';
import { AttachmentPreviewComponent } from '../attachment-preview/attachment-preview.component';

@Component({
  selector: 'step-attachment-preview-list',
  imports: [AttachmentPreviewComponent],
  templateUrl: './attachment-preview-list.component.html',
  styleUrl: './attachment-preview-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttachmentPreviewListComponent {
  readonly attachments = input([], {
    transform: (value?: AttachmentMeta[]) => value ?? [],
  });
}
