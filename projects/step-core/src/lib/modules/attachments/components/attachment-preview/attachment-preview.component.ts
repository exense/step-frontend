import { ChangeDetectionStrategy, Component, computed, inject, input, ViewEncapsulation } from '@angular/core';
import { AttachmentType } from '../../types/attachment-type.enum';
import { AttachmentUrlPipe } from '../../pipes/attachment-url.pipe';
import { SkippedAttachmentMeta } from '../../../../client/step-client-module';
import { StepBasicsModule } from '../../../basics/step-basics.module';
import { AttachmentUtilsService } from '../../injectables/attachment-utils.service';
import { NgOptimizedImage } from '@angular/common';
import { AttachmentDialogsService } from '../../injectables/attachment-dialogs.service';
import { AttachmentTypeIconPipe } from '../../pipes/attachment-type-icon.pipe';
import { StreamingTextComponent } from '../streaming-text/streaming-text.component';
import { StreamingAttachmentStatusDirective } from '../../directives/streaming-attachment-status.directive';
import { PreviewAttachmentMeta } from '../../types/preview-attachment-meta';
import { UndraggedClickDirective } from '../../../basics/directives/undragged-click.directive';

@Component({
  selector: 'step-attachment-preview',
  imports: [AttachmentUrlPipe, StepBasicsModule, NgOptimizedImage, AttachmentTypeIconPipe, StreamingTextComponent],
  templateUrl: './attachment-preview.component.html',
  styleUrl: './attachment-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.with-action-bar]':
      '(isStreamingFailed() || isStreamingInProgress() || showDownload()) && attachmentType() !== AttachmentType.SKIPPED',
    '[class.with-border]': 'withBorder()',
    '[class.has-pointer]': 'canOpenDetails()',
    '(undraggedClick)': 'open()',
    '[matTooltip]': 'attachmentTooltip()',
  },
  hostDirectives: [
    {
      directive: UndraggedClickDirective,
      outputs: ['undraggedClick'],
    },
    {
      directive: StreamingAttachmentStatusDirective,
      inputs: ['attachment'],
    },
  ],
})
export class AttachmentPreviewComponent {
  private _attachmentUtils = inject(AttachmentUtilsService);
  private _attachmentDialogs = inject(AttachmentDialogsService);
  private _streamingStatus = inject(StreamingAttachmentStatusDirective, { self: true });

  readonly showDownload = input(true);
  readonly withBorder = input(true);

  private readonly streamingStatus = computed(() => this._streamingStatus.status());

  protected readonly isStreamingInProgress = computed(() => {
    const status = this.streamingStatus();
    return !!status && status !== 'COMPLETED' && status !== 'FAILED';
  });

  protected readonly isStreamingFailed = computed(() => {
    const status = this.streamingStatus();
    return status === 'FAILED';
  });

  protected readonly attachment = computed(() => this._streamingStatus.attachment());
  protected readonly canUseStreamPreview = computed(
    () => (this.attachment() as PreviewAttachmentMeta)?.canUseStreamPreview,
  );

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

  protected readonly canOpenDetails = computed(() => {
    const attachmentType = this.attachmentType()!;
    return attachmentType !== AttachmentType.STREAMING_BINARY;
  });

  protected open(): void {
    if (!this.canOpenDetails()) {
      return;
    }
    this._attachmentDialogs.showDetails(this.attachment()!);
  }

  protected download($event: MouseEvent): void {
    $event.preventDefault();
    $event.stopPropagation();
    $event.stopImmediatePropagation();
    this._attachmentUtils.downloadAttachment(this.attachment());
  }
}
