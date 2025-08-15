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
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { IndicatorStateFactoryService, StepBasicsModule } from '../../../basics/step-basics.module';
import { RichEditorVerticalScroll, RichEditorComponent } from '../../../rich-editor';
import {
  AttachmentMeta,
  RequestLines,
  ResponseLines,
  WsChannel,
  WsFactoryService,
} from '../../../../client/step-client-module';
import { AttachmentStreamStatus } from '../../types/attachment-stream-status';
import { filter, map } from 'rxjs';
import { AttachmentUtilsService } from '../../injectables/attachment-utils.service';

enum Direction {
  UP,
  DOWN,
}

enum FrameChangeCause {
  INIT,
  PROGRESS,
  SCROLL,
}

interface FrameIndex {
  value: number;
  causedBy: FrameChangeCause;
}

interface FrameRequest {
  start: number;
  end: number;
  causedBy: FrameChangeCause;
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
  private _indicatorStateFactory = inject(IndicatorStateFactoryService);
  private wsChannel?: WsChannel<RequestLines, WsResourceStatusChange | ResponseLines>;

  private richEditor = viewChild('richEditor', { read: RichEditorComponent });

  private totalLines = signal(0);

  protected statusInternal = signal<AttachmentStreamStatus | undefined>(undefined);

  readonly status = this.statusInternal.asReadonly();

  private areLinesRequestedIndicator = this._indicatorStateFactory.createIndicatorState(500);
  readonly areLinesRequested = this.areLinesRequestedIndicator.isVisible;

  private frameRequest = signal<FrameRequest>({ start: 0, end: 0, causedBy: FrameChangeCause.INIT });
  private frameRequest$ = toObservable(this.frameRequest);

  readonly displayLatestRows = input<number | undefined>(undefined);
  readonly linesFrame = input<number>(Infinity);
  readonly fontSize = input(12);

  readonly scrollDownOnRefresh = model(true);

  readonly isFrameApplied = computed(() => {
    const linesFrame = this.linesFrame();
    const totalLines = this.totalLines();
    return linesFrame !== Infinity && totalLines > linesFrame;
  });

  private direction = Direction.DOWN;

  private frameInfoInternal = signal<{ startLineIndex: number; endLineIndex: number; totalLines: number }>({
    startLineIndex: 0,
    endLineIndex: 0,
    totalLines: 0,
  });
  readonly frameInfo = this.frameInfoInternal.asReadonly();

  protected readonly firstLineNumber = signal(1); //computed(() => this.startLineIndex().value + 1);
  protected readonly displayLatestRowsOnly = computed(() => this.displayLatestRows() !== undefined);

  readonly attachment = input.required<AttachmentMeta>();

  private attachmentUrl = computed(() => {
    const attachment = this.attachment();
    return this._attachmentUtils.getAttachmentStreamingUrl(attachment);
  });

  private effectSyncTotal = effect(() => {
    const totalLines = this.totalLines();
    this.frameInfoInternal.update((value) => ({ ...value, totalLines }));
  });

  private effectCreateSocket = effect(() => {
    const url = this.attachmentUrl();
    if (!url) {
      this.closeChannel();
      return;
    }
    this.createChannel(url);
  });

  private lines = signal<string[]>([]);
  private linesCount = computed(() => this.lines().length);
  protected readonly text = computed(() => this.lines().join(''));

  ngOnInit(): void {
    this.setupRequestsStream();
  }

  ngOnDestroy(): void {
    this.closeChannel();
  }

  protected handleVerticalScroll(verticalScroll: RichEditorVerticalScroll): void {
    const linesFrame = this.linesFrame();
    const frame = this.frameRequest();
    const total = this.totalLines();
    const startLindeIndex = this.calcStartLineIndex(frame, linesFrame);
    const endLineIndex = this.calcEndLineIndex(frame, linesFrame, total);
    const { start: frameStart, end: frameEnd } = frame;

    if (linesFrame === Infinity) {
      return;
    }

    const causedBy = FrameChangeCause.SCROLL;

    if (verticalScroll.firstRow < frameStart && frameStart - verticalScroll.firstRow + 1 >= linesFrame) {
      this.direction = Direction.UP;
      const start = verticalScroll.firstRow - 1;
      const end = verticalScroll.firstRow - 1 + linesFrame;
      this.frameRequest.set({ start, end, causedBy });
      return;
    }

    if ((verticalScroll.firstRow === 1 || verticalScroll.firstRow <= startLindeIndex) && startLindeIndex > 0) {
      this.direction = Direction.UP;
      const start = verticalScroll.firstRow - 1;
      const end = verticalScroll.firstRow - 1 + linesFrame;
      this.frameRequest.set({ start, end, causedBy });
      return;
    }

    if (verticalScroll.lastRow > frameEnd && verticalScroll.lastRow - frameEnd + 1 >= linesFrame) {
      this.direction = Direction.DOWN;
      const start = verticalScroll.lastRow - 1 - linesFrame;
      const end = verticalScroll.lastRow - 1;
      this.frameRequest.set({ start, end, causedBy });
      return;
    }

    if ((verticalScroll.lastRow === total - 1 || verticalScroll.lastRow >= endLineIndex) && endLineIndex < total - 1) {
      this.direction = Direction.DOWN;
      const start = total - 1 - linesFrame;
      const end = total - 1;
      this.frameRequest.set({ start, end, causedBy });
      return;
    }
  }

  private setupRequestsStream(): void {
    this.frameRequest$
      .pipe(
        map((frame) => {
          const linesFrame = this.linesFrame();
          const total = this.totalLines();
          const startingLineIndex = this.calcStartLineIndex(frame, linesFrame);
          const endLineIndex = this.calcEndLineIndex(frame, linesFrame, total);
          const linesCount = endLineIndex - startingLineIndex + 1;
          return { startingLineIndex, linesCount, causedBy: frame.causedBy };
        }),
        filter((request) => {
          const isScrollDownOnRefresh = this.scrollDownOnRefresh();
          const linesCount = this.linesCount();
          if (request.startingLineIndex === 0 && linesCount < request.linesCount) {
            return true;
          }
          return !(request.causedBy === FrameChangeCause.PROGRESS && !isScrollDownOnRefresh);
        }),
        map(
          ({ startingLineIndex, linesCount }) =>
            ({ startingLineIndex, linesCount, '@': 'RequestLines' }) as RequestLines,
        ),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe((request) => {
        this.areLinesRequestedIndicator.show();
        this.wsChannel?.send(request);
      });
  }

  private closeChannel(): void {
    this.wsChannel?.disconnect?.();
    this.wsChannel = undefined;
  }

  private proceedLinesResponse(lines: string[]): void {
    this.areLinesRequestedIndicator.hide();
    const displayLatestRows = this.displayLatestRows();
    if (displayLatestRows !== undefined) {
      lines = lines.slice(-displayLatestRows);
    }
    // Remove line separator from the last line to prevent extra row rendering
    let lastLine = lines[lines.length - 1];
    if (lastLine.endsWith('\n')) {
      lastLine = lastLine.slice(0, lastLine.length - 1);
      lines[lines.length - 1] = lastLine;
    }
    this.lines.set(lines);
    // zero timeout to be sure that text was rendered
    setTimeout(() => {
      this.afterTextUpdate();
    }, 0);
  }

  private afterTextUpdate(clearSelection: boolean = true): void {
    if (clearSelection) {
      this.richEditor()?.clearSelection?.();
    }
    const frame = this.frameRequest();
    const linesFrame = this.linesFrame();
    const total = this.totalLines();
    const isAutoScrollApplied = this.scrollDownOnRefresh();

    const startLineIndex = this.calcStartLineIndex(frame, linesFrame);
    const endLineIndex = this.calcEndLineIndex(frame, linesFrame, total);

    this.firstLineNumber.set(startLineIndex + 1);

    this.frameInfoInternal.update((value) => ({ ...value, startLineIndex, endLineIndex }));

    if (frame.causedBy === FrameChangeCause.SCROLL || isAutoScrollApplied) {
      if (this.direction === Direction.UP) {
        const row = frame.start - startLineIndex;
        this.richEditor()?.scrollToRowUpEdge?.(row);
      } else {
        const row = frame.end - startLineIndex;
        this.richEditor()?.scrollToRowBottomEdge?.(row);
      }
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
      if (transferStatus === 'FAILED' && totalLines === 0) {
        this.areLinesRequestedIndicator.hide();
        return;
      }

      this.totalLines.set(totalLines);
      const linesFrame = this.linesFrame();

      let newFrameStart = 0;
      let newFrameEnd = totalLines;

      if (linesFrame !== Infinity) {
        newFrameStart = totalLines - linesFrame;
      }

      this.frameRequest.set({ start: newFrameStart, end: newFrameEnd, causedBy: FrameChangeCause.PROGRESS });
      this.direction = Direction.DOWN;
    });
  }

  private calcStartLineIndex({ start }: FrameRequest, linesFrame: number): number {
    if (linesFrame === Infinity) {
      return start;
    }
    return Math.max(start - linesFrame, 0);
  }

  private calcEndLineIndex({ end }: FrameRequest, linesFrame: number, total: number): number {
    if (linesFrame === Infinity) {
      return total - 1;
    }

    return Math.min(end + linesFrame, total) - 1;
  }
}
