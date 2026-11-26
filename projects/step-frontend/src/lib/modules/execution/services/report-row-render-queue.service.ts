import { ChangeDetectorRef, ElementRef, inject, Injectable, NgZone, OnDestroy } from '@angular/core';
import { VIEW_MODE, ViewMode } from '../shared/view-mode';

const ROWS_PER_FRAME = 6;
// scrollMargin also gives rows inside nested scrolling panels a head start.
const ROW_VISIBILITY_OPTIONS = { rootMargin: '120px 0px', scrollMargin: '120px 0px' };

@Injectable()
export class ReportRowRenderQueueService implements OnDestroy {
  private readonly _zone = inject(NgZone);
  private readonly _host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _changeDetector = inject(ChangeDetectorRef);
  readonly immediate = inject(VIEW_MODE, { optional: true }) === ViewMode.PRINT;

  private readonly pending = new Map<HTMLElement, () => void>();
  private readonly nearViewport = new Set<HTMLElement>();
  private readonly pressedPointers = new Set<number>();
  private readonly windowListeners = new AbortController();
  private readonly visibilityObserver?: IntersectionObserver;
  private frame?: number;
  private task?: ReturnType<typeof setTimeout>;
  private layoutObserver?: ResizeObserver;
  private destroyed = false;
  private viewport?: HTMLElement;
  private style__previousOverflowAnchor = '';
  private anchor?: { element: HTMLElement; top: number; scrollTop: number };

  constructor() {
    if (this.immediate) return;
    this.visibilityObserver = this._zone.runOutsideAngular(() => {
      const signal = this.windowListeners.signal;
      window.addEventListener('beforeprint', this.renderForPrint, { signal });
      window.addEventListener('pointerup', this.endPress, { capture: true, signal });
      window.addEventListener('pointercancel', this.endPress, { capture: true, signal });
      window.addEventListener('blur', this.endPress, { signal });
      return new IntersectionObserver((entries) => {
        for (const entry of entries) {
          const row = entry.target as HTMLElement;
          if (entry.isIntersecting && this.pending.has(row)) this.nearViewport.add(row);
          else this.nearViewport.delete(row);
        }
        if (this.nearViewport.size) this.schedule();
      }, ROW_VISIBILITY_OPTIONS);
    });
  }

  enqueue(element: HTMLElement, render: () => void): () => void {
    this.pending.set(element, render);
    this.visibilityObserver?.observe(element);
    return () => {
      this.remove(element);
      if (!this.pending.size) this.schedule();
    };
  }

  holdForPress(pointerId: number): void {
    // Touch browsers can hit-test again for the click after release. Keep neighboring rows still until then.
    this.pressedPointers.add(pointerId);
    this.cancelScheduledWork();
  }

  private readonly endPress = (event: PointerEvent | FocusEvent): void => {
    if (!this.pressedPointers.size) return;
    if ('pointerId' in event) this.pressedPointers.delete(event.pointerId);
    else this.pressedPointers.clear();
    this.schedule();
  };

  ngOnDestroy(): void {
    this.destroyed = true;
    this.cancelScheduledWork();
    this.windowListeners.abort();
    this.visibilityObserver?.disconnect();
    this.stopWaitingForLayout();
    this.pending.clear();
    this.nearViewport.clear();
    this.releaseViewport();
  }

  private readonly renderForPrint = (): void => {
    if (!this.pending.size || !this.hasLayout()) return;
    for (const element of this.pending.keys()) this.renderRow(element);
    this._changeDetector.detectChanges();
  };

  private remove(element: HTMLElement): void {
    if (!this.pending.delete(element)) return;
    this.nearViewport.delete(element);
    this.visibilityObserver?.unobserve(element);
  }

  private renderRow(element: HTMLElement): void {
    const render = this.pending.get(element);
    this.remove(element);
    render?.();
  }

  private schedule(): void {
    if (this.destroyed || this.pressedPointers.size || this.frame !== undefined || this.task !== undefined) {
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
        if (!this.nearViewport.size) {
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
              if (this.nearViewport.has(row)) this.renderRow(row);
            }
          });
          this.schedule();
        }, 0);
      });
    });
  }

  private cancelScheduledWork(): void {
    if (this.frame !== undefined) cancelAnimationFrame(this.frame);
    if (this.task !== undefined) clearTimeout(this.task);
    this.frame = undefined;
    this.task = undefined;
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

  private nextBatch(): HTMLElement[] {
    if (!this.viewport) {
      this.viewport = this.scrollViewport();
      if (this.viewport) {
        this.style__previousOverflowAnchor = this.viewport.style.overflowAnchor;
        this.viewport.style.overflowAnchor = 'none';
      }
    }
    const { top, bottom } = this.visibleBounds();
    if (this.viewport && top < bottom) {
      const viewportTop = this.viewport.getBoundingClientRect().top;
      const rows = this._host.nativeElement.querySelectorAll<HTMLElement>('[stepReportRowRender]');
      for (const element of Array.from(rows)) {
        const rect = element.getBoundingClientRect();
        if (rect.height > 0 && rect.bottom > top && rect.top < bottom) {
          this.anchor = { element, top: rect.top - viewportTop, scrollTop: this.viewport.scrollTop };
          break;
        }
      }
    }
    return [...this.nearViewport]
      .map((row) => {
        const rect = row.getBoundingClientRect();
        const distance = Math.max(top - rect.bottom, rect.top - bottom, 0);
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

  private visibleBounds(): { top: number; bottom: number } {
    let top = 0;
    let bottom = window.innerHeight;
    for (
      let element = this._host.nativeElement.parentElement;
      element && element !== document.body;
      element = element.parentElement
    ) {
      if (!/^(auto|scroll|hidden|clip|overlay)$/.test(getComputedStyle(element).overflowY)) continue;
      const contentTop = element.getBoundingClientRect().top + element.clientTop;
      top = Math.max(top, contentTop);
      bottom = Math.min(bottom, contentTop + element.clientHeight);
    }
    return { top, bottom };
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
