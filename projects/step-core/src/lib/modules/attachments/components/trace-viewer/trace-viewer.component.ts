import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { DOCUMENT, Location } from '@angular/common';
import { APP_HOST } from '../../../../client/step-client-module';

@Component({
  selector: 'step-trace-viewer',
  imports: [],
  templateUrl: './trace-viewer.component.html',
  styleUrl: './trace-viewer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TraceViewerComponent {
  private _doc = inject(DOCUMENT);
  private _appHost = inject(APP_HOST);
  private _ngLocation = inject(Location);
  private _sanitizer = inject(DomSanitizer);

  readonly reportUrl = input('');

  private traceViewerPath = `${this._appHost}/trace-viewer/`;

  private traceViewerUrl = computed(() => {
    const reportUrl = this.reportUrl();
    const finalUrl = !reportUrl
      ? this.traceViewerPath
      : `${this.traceViewerPath}?trace=${this.prepareReportUrl(reportUrl)}`;
    return finalUrl;
  });

  protected readonly iframeTraceViewerUrl = computed(() => {
    const url = this.traceViewerUrl();
    return this._sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  openInSeparateTab(): void {
    const url = this.traceViewerUrl();
    this._doc.defaultView!.open(url, '_blank');
  }

  private prepareReportUrl(url: string): string {
    if (!url) {
      return '';
    }
    if (url.includes(this._appHost)) {
      return url;
    }
    return [this._ngLocation.normalize(this._appHost), this._ngLocation.normalize(url)].join('/');
  }
}
