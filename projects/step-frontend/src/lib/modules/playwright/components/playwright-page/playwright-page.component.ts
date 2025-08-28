import { afterNextRender, ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TraceViewerComponent } from '../trace-viewer/trace-viewer.component';
import { APP_HOST } from '@exense/step-core';

@Component({
  selector: 'step-playwright-page',
  imports: [TraceViewerComponent],
  templateUrl: './playwright-page.component.html',
  styleUrl: './playwright-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaywrightPageComponent {
  private _appHost = inject(APP_HOST);
  protected readonly reportExampleUrl = signal('');

  constructor() {
    afterNextRender(() => {
      setTimeout(() => {
        this.reportExampleUrl.set(`${this._appHost}/trace-report-example/trace-report-example.zip`);
      }, 5000);
    });
  }
}
