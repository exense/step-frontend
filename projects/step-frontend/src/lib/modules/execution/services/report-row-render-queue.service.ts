import { ElementRef, inject, Injectable, NgZone, OnDestroy } from '@angular/core';
import { VIEW_MODE, ViewMode } from '../shared/view-mode';

interface PendingReportRow {
  element: HTMLElement;
  prioritized: () => boolean;
  render: () => void;
}

const ROWS_PER_FRAME = 6;

@Injectable()
export class ReportRowRenderQueueService implements OnDestroy {
  private readonly _zone = inject(NgZone);
  private readonly _host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly immediate = inject(VIEW_MODE, { optional: true }) === ViewMode.PRINT;

  private readonly pending = new Set<PendingReportRow>();
  private frame?: number;
  private task?: ReturnType<typeof setTimeout>;
  private layoutObserver?: ResizeObserver;
  private destroyed = false;
  private viewport?: HTMLElement;
  private style__previousOverflowAnchor = '';
  private anchor?: { element: HTMLElement; top: number; scrollTop: number };

  enqueue(row: PendingReportRow): () => void {
    this.pending.add(row);
    this.schedule();
    return () => {
      this.pending.delete(row);
      this.schedule();
    };
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    if (this.frame !== undefined) cancelAnimationFrame(this.frame);
    if (this.task !== undefined) clearTimeout(this.task);
    this.stopWaitingForLayout();
    this.pending.clear();
    this.releaseViewport();
  }

  private schedule(): void {
    if (this.destroyed || this.frame !== undefined || this.task !== undefined) {
      return;
    }
    if (!this.pending.size && !this.anchor) {
      this.stopWaitingForLayout();
      this.releaseViewport();
      return;
    }
    if (this.layoutObserver) return;
    this._zone.runOutsideAngular(() => {
      this.frame = requestAnimationFrame(() => {
        this.frame = undefined;
        if (!this.hasLayout()) {
          this.waitForLayout();
          return;
        }
        this.restoreAnchor();
        if (!this.pending.size) {
          this.releaseViewport();
          return;
        }
        const batch = this.nextBatch();
        // A task after the frame lets the browser paint before creating more Angular views.
        this.task = setTimeout(() => {
          this.task = undefined;
          if (!this.hasLayout()) {
            this.waitForLayout();
            return;
          }
          this._zone.run(() => {
            for (const row of batch) {
              if (this.pending.delete(row)) row.render();
            }
          });
          this.schedule();
        }, 0);
      });
    });
  }

  private hasLayout(): boolean {
    return this._host.nativeElement.offsetWidth > 0;
  }

  private waitForLayout(): void {
    this.releaseViewport();
    if (!this.pending.size) return;
    this.layoutObserver = new ResizeObserver((entries) => {
      if (!entries.some((entry) => entry.contentRect.width > 0)) return;
      this.stopWaitingForLayout();
      this.schedule();
    });
    this.layoutObserver.observe(this._host.nativeElement);
  }

  private stopWaitingForLayout(): void {
    this.layoutObserver?.disconnect();
    this.layoutObserver = undefined;
  }

  private nextBatch(): PendingReportRow[] {
    if (!this.viewport) {
      this.viewport = this.scrollViewport();
      if (this.viewport) {
        this.style__previousOverflowAnchor = this.viewport.style.overflowAnchor;
        this.viewport.style.overflowAnchor = 'none';
      }
    }
    const bounds = this.viewport?.getBoundingClientRect();
    const top = bounds?.top ?? 0;
    const bottom = bounds?.bottom ?? window.innerHeight;
    if (this.viewport) {
      const rows = this._host.nativeElement.querySelectorAll<HTMLElement>('[stepReportRowRender]');
      for (const element of Array.from(rows)) {
        const rect = element.getBoundingClientRect();
        if (rect.bottom > top && rect.top < bottom) {
          this.anchor = { element, top: rect.top - top, scrollTop: this.viewport.scrollTop };
          break;
        }
      }
    }
    return [...this.pending]
      .map((row) => {
        const rect = row.element.getBoundingClientRect();
        const distance = row.prioritized() ? -1 : Math.max(top - rect.bottom, rect.top - bottom, 0);
        return { row, distance };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, ROWS_PER_FRAME)
      .map(({ row }) => row);
  }

  private restoreAnchor(): void {
    const anchor = this.anchor;
    const viewport = this.viewport;
    this.anchor = undefined;
    // Leave user scrolling alone; otherwise keep the same row at the same screen position.
    if (!anchor?.element.isConnected || !viewport || viewport.scrollTop !== anchor.scrollTop) return;
    viewport.scrollTop +=
      anchor.element.getBoundingClientRect().top - viewport.getBoundingClientRect().top - anchor.top;
  }

  private releaseViewport(): void {
    if (this.viewport) this.viewport.style.overflowAnchor = this.style__previousOverflowAnchor;
    this.viewport = undefined;
    this.anchor = undefined;
  }

  private scrollViewport(): HTMLElement | undefined {
    let element = this._host.nativeElement.parentElement;
    while (element && element !== document.body) {
      if (/(auto|scroll)/.test(getComputedStyle(element).overflowY) && element.scrollHeight > element.clientHeight) {
        return element;
      }
      element = element.parentElement;
    }
    return undefined;
  }
}
