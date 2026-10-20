import { Directive, ElementRef, inject, input, OnDestroy, OnInit, signal } from '@angular/core';
import { ReportRowRenderQueueService } from '../services/report-row-render-queue.service';

@Directive({
  selector: '[stepReportRowRender]',
  exportAs: 'stepReportRowRender',
  host: {
    '[attr.aria-busy]': '!ready()',
  },
})
export class ReportRowRenderDirective implements OnInit, OnDestroy {
  private readonly _queue = inject(ReportRowRenderQueueService);
  private readonly _element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly rendered = signal(this._queue.immediate);
  private cancel?: () => void;

  readonly selected = input(false);
  readonly ready = this.rendered.asReadonly();

  ngOnInit(): void {
    if (this.ready()) return;
    this.cancel = this._queue.enqueue({
      element: this._element.nativeElement,
      prioritized: () => this.selected(),
      render: () => this.rendered.set(true),
    });
  }

  ngOnDestroy(): void {
    this.cancel?.();
  }
}
