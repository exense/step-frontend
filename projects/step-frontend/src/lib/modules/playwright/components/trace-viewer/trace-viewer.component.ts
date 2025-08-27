import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

const TRACE_VIEWER_PATH = '/trace-viewer';

@Component({
  selector: 'step-trace-viewer',
  imports: [],
  templateUrl: './trace-viewer.component.html',
  styleUrl: './trace-viewer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TraceViewerComponent {
  private _sanitizer = inject(DomSanitizer);
  readonly reportUrl = input('');

  protected readonly traceViewerUrl = computed(() => {
    const reportUrl = this.reportUrl();
    const finalUrl = !reportUrl ? TRACE_VIEWER_PATH : `${TRACE_VIEWER_PATH}?trace=${reportUrl}`;
    return this._sanitizer.bypassSecurityTrustResourceUrl(finalUrl);
  });
}
