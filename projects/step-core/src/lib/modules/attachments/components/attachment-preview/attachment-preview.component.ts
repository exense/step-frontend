import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AttachmentUrlPipe } from '../../pipes/attachment-url.pipe';
import { AttachmentIsImagePipe } from '../../pipes/attachment-is-image.pipe';
import { AttachmentShowLabelPipe } from '../../pipes/attachment-show-label.pipe';
import { AttachmentIsTextPipe } from '../../pipes/attachment-is-text.pipe';
import { StepBasicsModule } from '../../../basics/step-basics.module';
import { AttachmentMeta } from '../../../../client/step-client-module';

@Component({
  selector: 'step-attachment-preview',
  templateUrl: './attachment-preview.component.html',
  styleUrls: ['./attachment-preview.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StepBasicsModule, AttachmentUrlPipe, AttachmentIsImagePipe, AttachmentShowLabelPipe, AttachmentIsTextPipe],
})
export class AttachmentPreviewComponent {
  readonly attachment = input<AttachmentMeta | undefined>(undefined);
}
