import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { AttachmentType } from '../../types/attachment-type.enum';
import { AttachmentUrlPipe } from '../../pipes/attachment-url.pipe';
import { AttachmentMeta, SkippedAttachmentMeta } from '../../../../client/step-client-module';
import { StepBasicsModule } from '../../../basics/step-basics.module';
import { AttachmentUtilsService } from '../../injectables/attachment-utils.service';
import { NgOptimizedImage } from '@angular/common';
import { AttachmentDialogsService } from '../../injectables/attachment-dialogs.service';
import { AttachmentTypeIconPipe } from '../../pipes/attachment-type-icon.pipe';
import { StreamingTextComponent } from '../streaming-text/streaming-text.component';

@Component({
  selector: 'step-attachment-preview',
  imports: [AttachmentUrlPipe, StepBasicsModule, NgOptimizedImage, AttachmentTypeIconPipe, StreamingTextComponent],
  templateUrl: './attachment-preview.component.html',
  styleUrl: './attachment-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.with-action-bar]': 'showDownload() && attachmentType() !== AttachmentType.SKIPPED',
    '[class.force-action-bar]': 'isStreamingInProgress()',
    '[class.with-border]': 'withBorder()',
    '(click)': 'open()',
    '[matTooltip]': 'attachmentTooltip()',
  },
})
export class AttachmentPreviewComponent {
  private _attachmentUtils = inject(AttachmentUtilsService);
  private _attachmentDialogs = inject(AttachmentDialogsService);

  private streamingText = viewChild('streamingText', { read: StreamingTextComponent });

  readonly attachment = input<AttachmentMeta | undefined>(undefined);
  readonly showDownload = input(true);
  readonly withBorder = input(true);

  protected readonly isStreamingInProgress = computed(() => {
    const status = this.streamingText()?.status?.();
    return !!status && status !== 'COMPLETED';
  });

  protected readonly attachmentType = computed(() => this._attachmentUtils.determineAttachmentType(this.attachment()));
  protected readonly AttachmentType = AttachmentType;
  protected readonly attachmentTooltip = computed(() => {
    const attachmentType = this.attachmentType();
    const attachment = this.attachment() as SkippedAttachmentMeta;
    if (attachmentType !== AttachmentType.SKIPPED) {
      return 'open attachment';
    }
    return attachment.reason;
  });

  protected open(): void {
    this._attachmentDialogs.showDetails(this.attachment()!);
  }

  protected download($event: MouseEvent): void {
    $event.preventDefault();
    $event.stopPropagation();
    $event.stopImmediatePropagation();
    this._attachmentUtils.downloadAttachment(this.attachment());
  }
}
