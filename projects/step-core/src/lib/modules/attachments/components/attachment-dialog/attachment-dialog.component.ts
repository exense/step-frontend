import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  model,
  OnInit,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AttachmentUtilsService } from '../../injectables/attachment-utils.service';
import { AttachmentType } from '../../types/attachment-type.enum';
import { FILE_TYPES, StepBasicsModule } from '../../../basics/step-basics.module';
import { AttachmentUrlPipe } from '../../pipes/attachment-url.pipe';
import {
  AttachmentMeta,
  AugmentedResourcesService,
  StreamingAttachmentMeta,
  UserService,
} from '../../../../client/step-client-module';
import { DOCUMENT } from '@angular/common';
import { AceMode, RichEditorComponent } from '../../../rich-editor';
import { FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize, from, map } from 'rxjs';
import { StreamingTextComponent } from '../streaming-text/streaming-text.component';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { TraceViewerComponent } from '../trace-viewer/trace-viewer.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../../../auth';

const DEFAULT_STREAMING_ATTACHMENT_LINE_CHUNK_SIZE = 10_000;
const IMAGE_ZOOM_PADDING_PX = 16;

@Component({
  selector: 'step-attachment-dialog',
  imports: [StepBasicsModule, AttachmentUrlPipe, RichEditorComponent, StreamingTextComponent, TraceViewerComponent],
  templateUrl: './attachment-dialog.component.html',
  styleUrl: './attachment-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.small]':
      '(attachmentType === AttachmentType.DEFAULT && !isPdfAttachment) || attachmentType === AttachmentType.SKIPPED',
  },
})
export class AttachmentDialogComponent implements OnInit {
  private _auth = inject(AuthService);
  private _destroyRef = inject(DestroyRef);
  private _resourceService = inject(AugmentedResourcesService);
  private _attachmentUtils = inject(AttachmentUtilsService);
  private _userService = inject(UserService);
  private _httpClient = inject(HttpClient);
  private _fb = inject(FormBuilder).nonNullable;
  private _snackBar = inject(MatSnackBar);
  private _sanitizer = inject(DomSanitizer);
  private _doc = inject(DOCUMENT);
  private _clipboard = this._doc.defaultView!.navigator.clipboard;
  protected readonly _data = inject<AttachmentMeta>(MAT_DIALOG_DATA);

  private readonly traceViewer = viewChild('traceViewer', { read: TraceViewerComponent });
  private readonly richEditor = viewChild('richEditor', { read: RichEditorComponent });
  private readonly streamingText = viewChild('streamingText', { read: StreamingTextComponent });
  private readonly imageContainer = viewChild<ElementRef<HTMLElement>>('imageContainer');
  private readonly imageElement = viewChild<ElementRef<HTMLImageElement>>('imageElement');
  private streamingAttachmentLineChunkSize$ = this._userService.getPreferences().pipe(
    map((preferences) => preferences?.preferences?.['attachment_line_chunk_size'] ?? ''),
    map((lineChunkSize) => parseInt(lineChunkSize)),
    map((lineChunkSize) => (isNaN(lineChunkSize) ? DEFAULT_STREAMING_ATTACHMENT_LINE_CHUNK_SIZE : lineChunkSize)),
  );
  protected readonly streamingAttachmentLineChunkSize = toSignal(this.streamingAttachmentLineChunkSize$, {
    initialValue: undefined,
  });

  private readonly streamingStatus = computed(
    () => this.streamingText()?.status?.() ?? (this._data as StreamingAttachmentMeta).status,
  );

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
  protected readonly canZoomImage = signal(false);
  protected readonly isImageZoomed = signal(false);
  protected readonly videoAttachmentUrl = signal<string | undefined>(undefined);
  protected readonly isVideoContentLoading = signal(false);

  protected readonly contentCtrl = this._fb.control('');
  protected readonly hasResourceReadPermission = toSignal(this._auth.hasRight$('resource-read'), {
    initialValue: this._auth.hasRight('resource-read'),
  });
  protected readonly isTextContentLoading = signal(false);
  protected readonly isTextContentLoaded = signal(false);
  protected readonly attachmentType = this._attachmentUtils.determineAttachmentType(this._data);
  protected readonly isXmlAttachment = this.matchesAttachmentType(FILE_TYPES.XML, FILE_TYPES.XML_TEXT);
  protected readonly isPdfAttachment = this.matchesAttachmentType(FILE_TYPES.PDF);
  protected readonly canRenderAttachment = this.determineCanRenderAttachment();
  protected readonly isSourceView = signal(!this.canRenderAttachment);
  protected readonly renderedAttachmentUrl = computed<SafeResourceUrl | undefined>(() => {
    const url = this._attachmentUtils.getDownloadAttachmentUrl(this._data, true);
    return this._sanitizer.bypassSecurityTrustResourceUrl(url);
  });
  protected readonly textAttachmentSyntaxMode = this.isXmlAttachment ? AceMode.XML : AceMode.TEXT;
  protected readonly AttachmentType = AttachmentType;

  protected readonly isAttachmentFinished = computed(() => {
    if (
      this.attachmentType !== AttachmentType.STREAMING_TEXT &&
      this.attachmentType !== AttachmentType.STREAMING_BINARY
    ) {
      return true;
    }
    const status = this.streamingStatus();
    return status === 'COMPLETED' || status === 'FAILED';
  });

  protected readonly canOpenAttachmentInSeparateTab = computed(() => {
    return (
      this.hasResourceReadPermission() && this.attachmentType !== AttachmentType.SKIPPED && this.isAttachmentFinished()
    );
  });

  constructor() {
    this._destroyRef.onDestroy(() => this.revokeVideoObjectUrl());
  }

  ngOnInit(): void {
    this.initializeContent();
  }

  protected download(): void {
    if (!this.hasResourceReadPermission()) {
      return;
    }
    this._attachmentUtils.downloadAttachment(this._data);
  }

  protected toggleScrollDownOnRefresh(): void {
    this.scrollDownOnRefresh.update((value) => !value);
  }

  protected openTraceViewerInSeparateTab(): void {
    if (!this.hasResourceReadPermission()) {
      return;
    }
    this.traceViewer()?.openInSeparateTab?.();
  }

  protected toggleSourceView(): void {
    const showSource = !this.isSourceView();
    this.isSourceView.set(showSource);
    if (showSource) {
      this.loadTextContent();
    }
  }

  protected openRenderedAttachmentInSeparateTab(): void {
    if (!this.canOpenAttachmentInSeparateTab()) {
      return;
    }
    const url = this._attachmentUtils.getDownloadAttachmentUrl(this._data, true);
    this._doc.defaultView!.open(url, '_blank');
  }

  protected updateCanZoomImage(): void {
    if (this.isImageZoomed()) {
      return;
    }
    const container = this.imageContainer()?.nativeElement;
    const image = this.imageElement()?.nativeElement;
    const containerWidth = container?.clientWidth ?? 0;
    const imageWidth = image?.clientWidth ?? 0;
    if (!containerWidth || !imageWidth) {
      return;
    }
    this.canZoomImage.set(imageWidth < containerWidth - IMAGE_ZOOM_PADDING_PX);
  }

  protected toggleImageZoom(): void {
    if (!this.canZoomImage() && !this.isImageZoomed()) {
      return;
    }
    this.isImageZoomed.update((isZoomed) => !isZoomed);
    setTimeout(() => this.updateCanZoomImage());
  }

  @HostListener('window:resize')
  protected handleWindowResize(): void {
    this.isImageZoomed.set(false);
    setTimeout(() => this.updateCanZoomImage());
  }

  private initializeContent(): void {
    this.contentCtrl.disable();
    if (this.attachmentType === AttachmentType.VIDEO) {
      this.loadVideoContent();
      return;
    }
    if (this.attachmentType !== AttachmentType.TEXT) {
      return;
    }
    if (this.isSourceView() || this.isXmlAttachment) {
      this.loadTextContent();
    }
  }

  private loadTextContent(): void {
    if (this.isTextContentLoading() || this.isTextContentLoaded()) {
      return;
    }
    this.isTextContentLoading.set(true);
    this._resourceService
      .getResourceContentAsText(this._data.id!)
      .pipe(
        takeUntilDestroyed(this._destroyRef),
        finalize(() => this.isTextContentLoading.set(false)),
      )
      .subscribe((content) => {
        this.contentCtrl.setValue(content);
        this.isTextContentLoaded.set(true);
        this.richEditor()?.clearSelection?.();
      });
  }

  private loadVideoContent(): void {
    if (this.isVideoContentLoading() || this.videoAttachmentUrl()) {
      return;
    }
    const fallbackUrl = this._attachmentUtils.getDownloadAttachmentUrl(this._data, true);
    this.isVideoContentLoading.set(true);
    this._httpClient
      .get(fallbackUrl, { responseType: 'blob' })
      .pipe(
        takeUntilDestroyed(this._destroyRef),
        finalize(() => this.isVideoContentLoading.set(false)),
      )
      .subscribe({
        next: (content) => {
          this.revokeVideoObjectUrl();
          const objectUrl = this._doc.defaultView!.URL.createObjectURL(content);
          this.videoAttachmentUrl.set(objectUrl);
        },
        error: () => this.videoAttachmentUrl.set(fallbackUrl),
      });
  }

  private revokeVideoObjectUrl(): void {
    const url = this.videoAttachmentUrl();
    if (!url?.startsWith('blob:')) {
      return;
    }
    this._doc.defaultView!.URL.revokeObjectURL(url);
    this.videoAttachmentUrl.set(undefined);
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

  private determineCanRenderAttachment(): boolean {
    return this.matchesAttachmentType(FILE_TYPES.HTML, FILE_TYPES.HTM);
  }

  private matchesAttachmentType(...types: Array<{ readonly extension?: string; readonly mimeType?: string }>): boolean {
    const mimeType = this._data.mimeType?.toLowerCase();
    if (mimeType && types.some((type) => type.mimeType?.toLowerCase() === mimeType)) {
      return true;
    }
    const extension = this._data.name?.split('.').pop()?.toLowerCase();
    return !!extension && types.some((type) => type.extension?.toLowerCase() === extension);
  }
}
