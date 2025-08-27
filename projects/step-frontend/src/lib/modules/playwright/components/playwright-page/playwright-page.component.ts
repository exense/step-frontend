import { afterNextRender, ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TraceViewerComponent } from '../trace-viewer/trace-viewer.component';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'step-playwright-page',
  imports: [TraceViewerComponent],
  templateUrl: './playwright-page.component.html',
  styleUrl: './playwright-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaywrightPageComponent {
  private _doc = inject(DOCUMENT);
  protected readonly reportExampleUrl = signal('');

  constructor() {
    afterNextRender(() => {
      setTimeout(() => {
        this.reportExampleUrl.set(`${this.appHost}/assets/trace-report-example.zip`);
      }, 5000);
    });
  }

  private get appHost(): string {
    const { location } = this._doc.defaultView as Window;
    return `${location.protocol}//${location.hostname}${location.port ? `:${location.port}` : ''}`;
  }
}
