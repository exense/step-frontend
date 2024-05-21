import { Component, computed, input, ViewEncapsulation } from '@angular/core';
import { ReportNodeSummary } from '../../shared/report-node-summary';

@Component({
  selector: 'step-alt-report-node-summary',
  templateUrl: './alt-report-node-summary.component.html',
  styleUrl: './alt-report-node-summary.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AltReportNodeSummaryComponent {
  /** @Input() **/
  title = input('');

  /** @Input() **/
  summary = input.required<ReportNodeSummary>();

  readonly percentPassed = computed(() => {
    const { passed, total } = this.summary();
    return this.calcPercent(passed, total);
  });

  readonly percentFailed = computed(() => {
    const { failed, total } = this.summary();
    return this.calcPercent(failed, total);
  });

  readonly percentTechError = computed(() => {
    const { techError, total } = this.summary();
    return this.calcPercent(techError, total);
  });

  readonly percentRunning = computed(() => {
    const { running, total } = this.summary();
    return this.calcPercent(running, total);
  });

  private calcPercent(count: number, total: number): number {
    return total ? (count / total) * 100 : 0;
  }
}
