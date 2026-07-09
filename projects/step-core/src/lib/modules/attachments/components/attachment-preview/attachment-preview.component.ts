import { ChangeDetectionStrategy, Component, computed, inject, input, ViewEncapsulation } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AttachmentType } from '../../types/attachment-type.enum';
import { AttachmentUrlPipe } from '../../pipes/attachment-url.pipe';
import { StepBasicsModule } from '../../../basics/step-basics.module';
import { AttachmentUtilsService } from '../../injectables/attachment-utils.service';
import { AttachmentDialogsService } from '../../injectables/attachment-dialogs.service';
import { AttachmentTypeIconPipe } from '../../pipes/attachment-type-icon.pipe';
import { StreamingTextComponent } from '../streaming-text/streaming-text.component';
import { StreamingAttachmentStatusDirective } from '../../directives/streaming-attachment-status.directive';
import { PreviewAttachmentMeta } from '../../types/preview-attachment-meta';
import { UndraggedClickDirective } from '../../../basics/directives/undragged-click.directive';
import { AuthService } from '../../../auth';
import { SkippedAttachmentInfoComponent } from '../skipped-attachment-info/skipped-attachment-info.component';

@Component({
  selector: 'step-attachment-preview',
  imports: [
    AttachmentUrlPipe,
    StepBasicsModule,
    AttachmentTypeIconPipe,
    StreamingTextComponent,
    SkippedAttachmentInfoComponent,
  ],
  templateUrl: './attachment-preview.component.html',
  styleUrl: './attachment-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.with-action-bar]':
      '(isStreamingFailed() || isStreamingInProgress() || showDownload()) && attachmentType() !== AttachmentType.SKIPPED',
    '[class.with-border]': 'withBorder()',
    '[class.has-pointer]': 'canOpenDetails()',
    '(undraggedClick)': 'open($event)',
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
  private _auth = inject(AuthService);
  private _attachmentUtils = inject(AttachmentUtilsService);
  private _attachmentDialogs = inject(AttachmentDialogsService);
  private _streamingStatus = inject(StreamingAttachmentStatusDirective, { self: true });

  readonly showDownload = input(true);
  readonly withBorder = input(true);

  protected readonly hasResourceReadPermission = toSignal(this._auth.hasRight$('resource-read'), {
    initialValue: this._auth.hasRight('resource-read'),
  });

  private readonly streamingStatus = computed(() => this._streamingStatus.status());

  protected readonly isStreamingInProgress = computed(() => {
    const status = this.streamingStatus();
    return !!status && status !== 'COMPLETED' && status !== 'FAILED';
  });

  protected readonly isStreamingFailed = computed(() => {
    const status = this.streamingStatus();
    return status === 'FAILED';
  });

  protected readonly isStreamingFinished = computed(() => {
    const status = this.streamingStatus();
    return status === 'COMPLETED' || status === 'FAILED';
  });

  protected readonly attachment = computed(() => this._streamingStatus.attachment());
  protected readonly canUseStreamPreview = computed(
    () => (this.attachment() as PreviewAttachmentMeta)?.canUseStreamPreview,
  );
  protected readonly textPreview = computed(() => (this.attachment() as PreviewAttachmentMeta)?.textPreview);
  protected readonly hasTextPreview = computed(() => this.textPreview() !== undefined);

  protected readonly attachmentType = computed(() => this._attachmentUtils.determineAttachmentType(this.attachment()));
  protected readonly AttachmentType = AttachmentType;
  protected readonly attachmentTooltip = computed(() => {
    const attachmentType = this.attachmentType();
    if (attachmentType === AttachmentType.SKIPPED) {
      return undefined;
    }
    if (!this.hasResourceReadPermission()) {
      return 'Missing resource-read permission';
    }
    return 'open attachment';
  });

  protected readonly canOpenDetails = computed(() => {
    const attachmentType = this.attachmentType()!;
    if (!this.hasResourceReadPermission() || attachmentType === AttachmentType.SKIPPED) {
      return false;
    }
    return attachmentType !== AttachmentType.STREAMING_BINARY || this.isStreamingFinished();
  });

  protected open($event: MouseEvent): void {
    $event.preventDefault();
    $event.stopPropagation();
    $event.stopImmediatePropagation();
    if (!this.canOpenDetails()) {
      return;
    }
    this._attachmentDialogs.showDetails(this.attachment()!);
  }

  protected download($event: MouseEvent): void {
    $event.preventDefault();
    $event.stopPropagation();
    $event.stopImmediatePropagation();
    if (!this.hasResourceReadPermission()) {
      return;
    }
    this._attachmentUtils.downloadAttachment(this.attachment());
  }
}
