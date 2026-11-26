import { Directive, ElementRef, inject, input, OnChanges, OnDestroy, OnInit, signal } from '@angular/core';
import { ReportRowRenderQueueService } from '../services/report-row-render-queue.service';

@Directive({
  selector: '[stepReportRowRender]',
  exportAs: 'stepReportRowRender',
  host: {
    '[attr.aria-busy]': '!ready()',
    '(pointerdown)': 'capturePendingPress($event)',
  },
})
export class ReportRowRenderDirective implements OnChanges, OnInit, OnDestroy {
  private readonly _queue = inject(ReportRowRenderQueueService);
  private readonly _element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly rendered = signal(this._queue.immediate);
  private cancel?: () => void;

  readonly selected = input(false);
  readonly ready = this.rendered.asReadonly();

  ngOnChanges(): void {
    if (this.selected()) this.renderNow();
  }

  ngOnInit(): void {
    if (this.ready()) return;
    this.cancel = this._queue.enqueue(this._element.nativeElement, () => this.rendered.set(true));
  }

  protected capturePendingPress(event: PointerEvent): void {
    if (!this.ready() && event.isPrimary && event.button === 0) {
      this._element.nativeElement.setPointerCapture(event.pointerId);
      this._queue.holdForPress(event.pointerId);
    }
  }

  renderNow(): void {
    if (this.ready()) return;
    this.cancel?.();
    this.rendered.set(true);
  }

  ngOnDestroy(): void {
    this.cancel?.();
  }
}
