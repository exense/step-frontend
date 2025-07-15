import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  model,
  OnDestroy,
  OnInit,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { WsResourceStatusChange } from '../../types/ws-resource-status-change';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StepBasicsModule } from '../../../basics/step-basics.module';
import { RichEditorComponent } from '../../../rich-editor';
import { AttachmentMeta, RequestChunk, WsChannel, WsFactoryService } from '../../../../client/step-client-module';
import { AttachmentStreamStatus } from '../../types/attachment-stream-status';
import { distinctUntilChanged, map, Subject } from 'rxjs';

@Component({
  selector: 'step-streaming-text',
  standalone: true,
  imports: [StepBasicsModule, RichEditorComponent],
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.hide-cursor]': 'useRowsLimit()',
  },
  templateUrl: './streaming-text.component.html',
  styleUrl: './streaming-text.component.scss',
})
export class StreamingTextComponent implements OnInit, OnDestroy {
  private _wsFactory = inject(WsFactoryService);
  private _destroyRef = inject(DestroyRef);
  private decoder = new TextDecoder('utf-8');
  private wsChannel?: WsChannel<RequestChunk, WsResourceStatusChange>;
  private requests$ = new Subject<Omit<RequestChunk, '@'>>();

  private richEditor = viewChild('richEditor', { read: RichEditorComponent });

  private currentSize = signal(0);
  private bytesReceived = signal(0);

  readonly status = model<AttachmentStreamStatus | undefined>(undefined);

  readonly displayLatestRows = input<number | undefined>(undefined);

  protected readonly useRowsLimit = computed(() => this.displayLatestRows() !== undefined);

  readonly attachment = input.required<AttachmentMeta>();

  private attachmentUrl = computed(() => {
    const attachmentId = this.attachment().id;
    return !!attachmentId ? `/streaming/download/${attachmentId}` : undefined;
  });

  private effectCreateSocket = effect(() => {
    const url = this.attachmentUrl();
    if (!url) {
      this.closeChannel();
      return;
    }
    this.createChannel(url);
  });

  private readonly textData = signal('');

  protected readonly text = computed(() => {
    const textData = this.textData();
    const displayLatestRows = this.displayLatestRows();
    if (displayLatestRows === undefined) {
      return textData;
    }
    const latestRows = textData.split('\n').slice(-displayLatestRows);
    return latestRows.join('\n');
  });

  ngOnInit(): void {
    this.setupRequestsStream();
  }

  ngOnDestroy(): void {
    this.closeChannel();
    this.requests$.complete();
  }

  private setupRequestsStream(): void {
    this.requests$
      .pipe(
        distinctUntilChanged((a, b) => a.startOffset === b.startOffset && a.endOffset === b.endOffset),
        map((request) => ({ ...request, '@': 'RequestChunk' }) as RequestChunk),
      )
      .subscribe((request) => this.wsChannel?.send(request));
  }

  private closeChannel(): void {
    this.wsChannel?.disconnect();
    this.wsChannel = undefined;
  }

  private decodeTextFromBinaryResponse(response: Blob): void {
    response.arrayBuffer().then((buffer) => {
      const text = this.decoder.decode(buffer);
      this.bytesReceived.update((value) => value + buffer.byteLength);
      if (this.useRowsLimit()) {
        this.textData.set(text);
      } else {
        this.textData.update((value) => value + text);
      }

      const navigateToBottom = this.status() === 'IN_PROGRESS';
      // zero timeout to be sure that text was rendered
      setTimeout(() => {
        this.afterTextUpdate(navigateToBottom);
      }, 0);
    });
  }

  private afterTextUpdate(navigateToBottom?: boolean, clearSelection: boolean = true): void {
    if (clearSelection) {
      this.richEditor()?.clearSelection?.();
    }

    if (navigateToBottom) {
      this.richEditor()?.scrollBottom?.();
    }
  }

  private createChannel(url: string): void {
    this.closeChannel();
    this.wsChannel = this._wsFactory.connect(url);
    this.wsChannel.data$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((response) => {
      if (response instanceof Blob) {
        this.decodeTextFromBinaryResponse(response);
        return;
      }

      const { transferStatus, currentSize } = response.resourceStatus;
      this.status.set(transferStatus);
      if (transferStatus === 'FAILED') {
        return;
      }

      this.currentSize.set(currentSize);
      const startOffset = this.bytesReceived();
      const endOffset = currentSize;
      if (startOffset < endOffset) {
        this.requests$.next({ startOffset, endOffset });
      }
    });
  }
}
