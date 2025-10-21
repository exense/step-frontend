import { ChangeDetectionStrategy, Component, inject, input, ViewEncapsulation } from '@angular/core';
import { AttachmentMeta, StreamingAttachmentMeta } from '../../../../client/step-client-module';
import { AttachmentType } from '../../types/attachment-type.enum';
import { AttachmentDialogsService } from '../../injectables/attachment-dialogs.service';
import { AttachmentPreviewComponent } from '../attachment-preview/attachment-preview.component';
import { AttachmentTypeIconPipe } from '../../pipes/attachment-type-icon.pipe';
import { AttachmentTypePipe } from '../../pipes/attachment-type.pipe';
import { PopoverMode, StepBasicsModule } from '../../../basics/step-basics.module';
import { StreamingAttachmentIndicatorComponent } from '../streaming-attachment-indicator/streaming-attachment-indicator.component';
import { AttachmentUtilsService } from '../../injectables/attachment-utils.service';

@Component({
  selector: 'step-attachments-inline-preview',
  imports: [
    AttachmentPreviewComponent,
    AttachmentTypeIconPipe,
    AttachmentTypePipe,
    StepBasicsModule,
    StreamingAttachmentIndicatorComponent,
  ],
  templateUrl: './attachments-inline-preview.component.html',
  styleUrl: './attachments-inline-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class AttachmentsInlinePreviewComponent {
  private _attachmentDialogs = inject(AttachmentDialogsService);
  private _attachmentUtils = inject(AttachmentUtilsService);

  readonly attachmentMetas = input([], {
    transform: (value?: AttachmentMeta[]) => value ?? [],
  });

  protected readonly AttachmentType = AttachmentType;

  protected open(attachment: AttachmentMeta, $event: MouseEvent): void {
    $event.preventDefault();
    $event.stopPropagation();
    $event.stopImmediatePropagation();
    this._attachmentDialogs.showDetails(attachment);
  }

  protected downloadBinaryStream(attachment: StreamingAttachmentMeta, $event: MouseEvent): void {
    if (attachment.status !== 'COMPLETED' && attachment.status !== 'FAILED') {
      return;
    }
    $event.preventDefault();
    $event.stopPropagation();
    $event.stopImmediatePropagation();
    this._attachmentUtils.downloadAttachment(attachment);
  }

  protected readonly PopoverMode = PopoverMode;
  protected readonly eval = eval;
}
