import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AttachmentMeta } from '../../../../client/generated';
import { AltAttachmentPreviewComponent } from '../alt-attachment-preview/alt-attachment-preview.component';

@Component({
  selector: 'step-alt-attachments-previews',
  standalone: true,
  imports: [AltAttachmentPreviewComponent],
  templateUrl: './alt-attachments-previews.component.html',
  styleUrl: './alt-attachments-previews.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AltAttachmentsPreviewsComponent {
  readonly attachments = input([], {
    transform: (value?: AttachmentMeta[]) => value ?? [],
  });
}
