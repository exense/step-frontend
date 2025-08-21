import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  model,
  OnInit,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AttachmentUtilsService } from '../../injectables/attachment-utils.service';
import { AttachmentType } from '../../types/attachment-type.enum';
import { StepBasicsModule } from '../../../basics/step-basics.module';
import { AttachmentUrlPipe } from '../../pipes/attachment-url.pipe';
import { AttachmentMeta, AugmentedResourcesService, UserService } from '../../../../client/step-client-module';
import { DOCUMENT, NgOptimizedImage } from '@angular/common';
import { RichEditorComponent } from '../../../rich-editor';
import { FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { from, map } from 'rxjs';
import { StreamingTextComponent } from '../streaming-text/streaming-text.component';
import { toSignal } from '@angular/core/rxjs-interop';

const DEFAULT_STREAMING_ATTACHMENT_LINE_CHUNK_SIZE = 10_000;

@Component({
  selector: 'step-attachment-dialog',
  imports: [StepBasicsModule, AttachmentUrlPipe, NgOptimizedImage, RichEditorComponent, StreamingTextComponent],
  templateUrl: './attachment-dialog.component.html',
  styleUrl: './attachment-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.small]': 'attachmentType === AttachmentType.DEFAULT || attachmentType === AttachmentType.SKIPPED',
  },
})
export class AttachmentDialogComponent implements OnInit {
  private _resourceService = inject(AugmentedResourcesService);
  private _attachmentUtils = inject(AttachmentUtilsService);
  private _userService = inject(UserService);
  private _fb = inject(FormBuilder).nonNullable;
  private _snackBar = inject(MatSnackBar);
  private _clipboard = inject(DOCUMENT).defaultView!.navigator.clipboard;
  protected readonly _data = inject<AttachmentMeta>(MAT_DIALOG_DATA);

  private richEditor = viewChild('richEditor', { read: RichEditorComponent });
  private streamingText = viewChild('streamingText', { read: StreamingTextComponent });
  private streamingAttachmentLineChunkSize$ = this._userService.getPreferences().pipe(
    map((preferences) => preferences?.preferences?.['attachment_line_chunk_size'] ?? ''),
    map((lineChunkSize) => parseInt(lineChunkSize)),
    map((lineChunkSize) => (isNaN(lineChunkSize) ? DEFAULT_STREAMING_ATTACHMENT_LINE_CHUNK_SIZE : lineChunkSize)),
  );
  protected readonly streamingAttachmentLineChunkSize = toSignal(this.streamingAttachmentLineChunkSize$, {
    initialValue: undefined,
  });

  private streamingStatus = computed(() => this.streamingText()?.status?.());

  protected readonly isStreamingInProgress = computed(() => {
    const status = this.streamingStatus();
    return !!status && status !== 'COMPLETED' && status !== 'FAILED';
  });

  protected readonly isStreamingFailed = computed(() => {
    const status = this.streamingStatus();
    return status === 'FAILED';
  });

  protected readonly areLinesRequestInProgress = computed(() => {
    return this.streamingText()?.areLinesRequested?.();
  });

  protected readonly frameMessage = computed(() => {
    const streamingText = this.streamingText();
    const isFrameApplied = streamingText?.isFrameApplied?.();
    const frameInfo = streamingText?.frameInfo?.();
    if (!isFrameApplied) {
      return undefined;
    }
    return `Displaying line ${(frameInfo?.startLineIndex ?? 0) + 1} - ${(frameInfo?.endLineIndex ?? 0) + 1} of ${frameInfo?.totalLines ?? 0}`;
  });

  protected readonly scrollDownOnRefresh = model(true);

  protected readonly contentCtrl = this._fb.control('');
  protected readonly attachmentType = this._attachmentUtils.determineAttachmentType(this._data);
  protected readonly AttachmentType = AttachmentType;

  ngOnInit(): void {
    this.initializeContent();
  }

  protected download(): void {
    this._attachmentUtils.downloadAttachment(this._data);
  }

  protected toggleScrollDownOnRefresh(): void {
    this.scrollDownOnRefresh.update((value) => !value);
  }

  private initializeContent(): void {
    this.contentCtrl.disable();
    if (this.attachmentType !== AttachmentType.TEXT) {
      return;
    }
    this._resourceService.getResourceContentAsText(this._data.id!).subscribe((content) => {
      this.contentCtrl.setValue(content);
      this.richEditor()?.clearSelection?.();
    });
  }

  protected copyTextContentToClipboard(): void {
    if (this.attachmentType !== AttachmentType.TEXT) {
      return;
    }
    const content = this.contentCtrl.value;
    from(this._clipboard.writeText(content)).subscribe(() => {
      this._snackBar.open(`Text copied to clipboard.`, 'dismiss');
    });
  }
}
