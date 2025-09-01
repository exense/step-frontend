import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { APP_HOST } from '@exense/step-core';

@Component({
  selector: 'step-trace-viewer',
  imports: [],
  templateUrl: './trace-viewer.component.html',
  styleUrl: './trace-viewer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TraceViewerComponent {
  private _appHost = inject(APP_HOST);
  private _sanitizer = inject(DomSanitizer);

  readonly reportUrl = input('');

  private traceViewerPath = `${this._appHost}/trace-viewer/`;

  protected readonly traceViewerUrl = computed(() => {
    const reportUrl = this.reportUrl();
    const finalUrl = !reportUrl ? this.traceViewerPath : `${this.traceViewerPath}?trace=${reportUrl}`;
    return this._sanitizer.bypassSecurityTrustResourceUrl(finalUrl);
  });
}
