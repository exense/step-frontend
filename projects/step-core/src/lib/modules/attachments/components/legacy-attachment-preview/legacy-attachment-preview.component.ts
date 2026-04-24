import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AttachmentUrlPipe } from '../../pipes/attachment-url.pipe';
import { AttachmentIsImagePipe } from '../../pipes/attachment-is-image.pipe';
import { AttachmentShowLabelPipe } from '../../pipes/attachment-show-label.pipe';
import { AttachmentIsTextPipe } from '../../pipes/attachment-is-text.pipe';
import { StepBasicsModule } from '../../../basics/step-basics.module';
import { AttachmentMeta } from '../../../../client/step-client-module';
import { AuthService } from '../../../auth';

@Component({
  selector: 'step-legacy-attachment-preview',
  templateUrl: './legacy-attachment-preview.component.html',
  styleUrls: ['./legacy-attachment-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StepBasicsModule, AttachmentUrlPipe, AttachmentIsImagePipe, AttachmentShowLabelPipe, AttachmentIsTextPipe],
})
export class LegacyAttachmentPreviewComponent {
  private _auth = inject(AuthService);

  readonly attachment = input<AttachmentMeta | undefined>(undefined);
  protected readonly hasResourceReadPermission = toSignal(this._auth.hasRight$('resource-read'), {
    initialValue: this._auth.hasRight('resource-read'),
  });
}
