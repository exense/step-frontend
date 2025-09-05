import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { APP_HOST } from '../../../basics/step-basics.module';
import { Location } from '@angular/common';

@Component({
  selector: 'step-trace-viewer',
  imports: [],
  templateUrl: './trace-viewer.component.html',
  styleUrl: './trace-viewer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TraceViewerComponent {
  private _appHost = inject(APP_HOST);
  private _ngLocation = inject(Location);
  private _sanitizer = inject(DomSanitizer);

  readonly reportUrl = input('');

  private traceViewerPath = this.createTraceViewerPath();

  protected readonly traceViewerUrl = computed(() => {
    const reportUrl = this.reportUrl();
    const finalUrl = !reportUrl
      ? this.traceViewerPath
      : `${this.traceViewerPath}?trace=${this.prepareReportUrl(reportUrl)}`;
    return this._sanitizer.bypassSecurityTrustResourceUrl(finalUrl);
  });

  private prepareReportUrl(url: string): string {
    if (!url) {
      return '';
    }
    if (url.includes(this._appHost)) {
      return url;
    }
    return [this._ngLocation.normalize(this._appHost), this._ngLocation.normalize(url)].join('/');
  }

  private createTraceViewerPath(): string {
    let result = `${this._appHost}/trace-viewer`;
    if (!this._appHost.includes('localhost')) {
      result += '/';
    }
    return result;
  }
}
