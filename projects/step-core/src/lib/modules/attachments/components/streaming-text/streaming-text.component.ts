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
import { RichEditorVerticalScroll, RichEditorComponent } from '../../../rich-editor';
import {
  AttachmentMeta,
  RequestLines,
  ResponseLines,
  WsChannel,
  WsFactoryService,
} from '../../../../client/step-client-module';
import { AttachmentStreamStatus } from '../../types/attachment-stream-status';
import { distinctUntilChanged, map, Subject } from 'rxjs';
import { AttachmentUtilsService } from '../../injectables/attachment-utils.service';

enum Direction {
  UP,
  DOWN,
}

@Component({
  selector: 'step-streaming-text',
  standalone: true,
  imports: [StepBasicsModule, RichEditorComponent],
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.hide-cursor]': 'displayLatestRowsOnly()',
  },
  templateUrl: './streaming-text.component.html',
  styleUrl: './streaming-text.component.scss',
})
export class StreamingTextComponent implements OnInit, OnDestroy {
  private _attachmentUtils = inject(AttachmentUtilsService);
  private _wsFactory = inject(WsFactoryService);
  private _destroyRef = inject(DestroyRef);
  private wsChannel?: WsChannel<RequestLines, WsResourceStatusChange | ResponseLines>;
  private requests$ = new Subject<Omit<RequestLines, '@'>>();

  private richEditor = viewChild('richEditor', { read: RichEditorComponent });

  private totalLines = signal(0);

  protected statusInternal = signal<AttachmentStreamStatus | undefined>(undefined);

  readonly status = this.statusInternal.asReadonly();

  readonly displayLatestRows = input<number | undefined>(undefined);
  readonly linesFrame = input<number>(Infinity);

  private frameStart = signal(0);
  private frameEnd = signal(0);

  readonly isFrameApplied = computed(() => {
    const linesFrame = this.linesFrame();
    const totalLines = this.totalLines();
    return linesFrame !== Infinity && totalLines > linesFrame;
  });

  private direction = Direction.DOWN;

  readonly startLineIndex = computed(() => {
    const frameStart = this.frameStart();
    const linesFrame = this.linesFrame();

    if (linesFrame === Infinity) {
      return frameStart;
    }

    return Math.max(frameStart - linesFrame, 0);
  });

  readonly endLineIndex = computed(() => {
    const frameEnd = this.frameEnd();
    const linesFrame = this.linesFrame();
    const total = this.totalLines();

    if (linesFrame === Infinity) {
      return total;
    }

    return Math.min(frameEnd + linesFrame, total);
  });

  private effectGetLines = effect(() => {
    const startingLineIndex = this.startLineIndex();
    const endLineIndex = this.endLineIndex();
    const linesCount = endLineIndex - startingLineIndex;
    this.requests$.next({ startingLineIndex, linesCount });
  });

  protected readonly firstLineNumber = computed(() => this.startLineIndex() + 1);
  protected readonly displayLatestRowsOnly = computed(() => this.displayLatestRows() !== undefined);

  readonly attachment = input.required<AttachmentMeta>();

  private attachmentUrl = computed(() => {
    const attachment = this.attachment();
    return this._attachmentUtils.getAttachmentStreamingUrl(attachment);
  });

  private effectCreateSocket = effect(() => {
    const url = this.attachmentUrl();
    if (!url) {
      this.closeChannel();
      return;
    }
    this.createChannel(url);
  });

  protected readonly text = signal('');

  ngOnInit(): void {
    this.setupRequestsStream();
  }

  ngOnDestroy(): void {
    this.closeChannel();
    this.requests$.complete();
  }

  protected handleVerticalScroll(verticalScroll: RichEditorVerticalScroll): void {
    const linesFrame = this.linesFrame();
    const frameStart = this.frameStart();
    const frameEnd = this.frameEnd();
    const startLindeIndex = this.startLineIndex();
    const endLineIndex = this.endLineIndex();
    const total = this.totalLines();
    if (linesFrame === Infinity) {
      return;
    }
    if (verticalScroll.firstRow < frameStart && frameStart - verticalScroll.firstRow + 1 >= linesFrame) {
      this.direction = Direction.UP;
      this.frameStart.set(verticalScroll.firstRow - 1);
      this.frameEnd.set(verticalScroll.firstRow - 1 + linesFrame);
      return;
    }
    if (verticalScroll.firstRow === 1 && startLindeIndex > 0) {
      this.direction = Direction.UP;
      this.frameStart.set(verticalScroll.firstRow - 1);
      this.frameEnd.set(verticalScroll.firstRow - 1 + linesFrame);
      return;
    }
    if (verticalScroll.lastRow > frameEnd && verticalScroll.lastRow - frameEnd + 1 >= linesFrame) {
      this.direction = Direction.DOWN;
      this.frameStart.set(verticalScroll.lastRow - 1 - linesFrame);
      this.frameEnd.set(verticalScroll.lastRow - 1);
      return;
    }
    if (verticalScroll.lastRow === total - 1 && endLineIndex < total - 1) {
      this.direction = Direction.DOWN;
      this.frameStart.set(total - 1 - linesFrame);
      this.frameEnd.set(total - 1);
    }
  }

  private setupRequestsStream(): void {
    this.requests$
      .pipe(
        distinctUntilChanged((a, b) => a.startingLineIndex === b.startingLineIndex && a.linesCount === b.linesCount),
        map((request) => ({ ...request, '@': 'RequestLines' }) as RequestLines),
      )
      .subscribe((request) => this.wsChannel?.send(request));
  }

  private closeChannel(): void {
    this.wsChannel?.disconnect?.();
    this.wsChannel = undefined;
  }

  private proceedLinesResponse(lines: string[]): void {
    const displayLatestRows = this.displayLatestRows();
    if (displayLatestRows !== undefined) {
      lines = lines.slice(-displayLatestRows);
    }
    this.text.set(lines.join(''));
    // zero timeout to be sure that text was rendered
    setTimeout(() => {
      this.afterTextUpdate();
    }, 0);
  }

  private afterTextUpdate(clearSelection: boolean = true): void {
    if (clearSelection) {
      this.richEditor()?.clearSelection?.();
    }

    if (this.direction === Direction.UP) {
      const row = this.frameStart() - this.startLineIndex();
      this.richEditor()?.scrollToRowUpEdge?.(row);
    } else {
      const row = this.frameEnd() - this.startLineIndex();
      this.richEditor()?.scrollToRowBottomEdge?.(row);
    }
  }

  private createChannel(url: string): void {
    this.closeChannel();
    this.wsChannel = this._wsFactory.connect(url);
    this.wsChannel.data$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((response) => {
      if (response instanceof Blob) {
        console.error('Binary data is not supported for text streaming');
        return;
      }

      if (response['@'] === 'Lines') {
        this.proceedLinesResponse(response.lines);
        return;
      }

      const { transferStatus, numberOfLines: totalLines } = response.resourceStatus;
      this.statusInternal.set(transferStatus);
      if (transferStatus === 'FAILED') {
        return;
      }

      this.totalLines.set(totalLines);
      this.direction = Direction.DOWN;
      const linesFrame = this.linesFrame();
      if (linesFrame !== Infinity) {
        this.frameEnd.set(totalLines);
        this.frameStart.set(totalLines - linesFrame);
      } else {
        this.frameStart.set(0);
        this.frameEnd.set(totalLines);
      }
    });
  }
}
