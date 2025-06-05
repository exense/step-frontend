import { Component, computed, input } from '@angular/core';
import { ExecutionSummaryDto } from '@exense/step-core';

@Component({
  selector: 'step-status-distribution',
  templateUrl: './status-distribution.component.html',
  styleUrls: ['./status-distribution.component.scss'],
  standalone: false,
})
export class StatusDistributionComponent {
  /*@Input() */
  summary = input<ExecutionSummaryDto | undefined>(undefined);

  /*@Input() */
  isProgress = input(false);

  readonly distributionState = computed(() => {
    const summary = this.summary();
    if (!summary) {
      return undefined;
    }
    const inProgress = this.isProgress();

    let [passed, percentPassed] = this.getCountAndPercent(summary, 'PASSED');
    if (!inProgress && summary.count === 0) {
      percentPassed = 100; // show a green bar if there have been zero keyword calls on completion
    }

    const [failedError, percentFailedError] = this.getCountAndPercent(summary, 'FAILED');
    const [techError, percentTechError] = this.getCountAndPercent(summary, 'TECHNICAL_ERROR');

    const [count, countPercent] = this.calcPercent(summary.count, summary.countForecast);

    const tooltipMessage = `${summary.label ?? ''} PASSED: ${passed}, FAILED: ${failedError},  TECHNICAL_ERROR: ${techError}`;

    const tooltipProgressMessage = `Progress: ${summary.count ?? 0}/${summary.countForecast ?? 0}`;

    return {
      passed,
      percentPassed,
      failedError,
      techError,
      percentFailedError,
      percentTechError,
      count,
      countPercent,
      tooltipMessage,
      tooltipProgressMessage,
    };
  });

  private calcPercent(count: number, total: number): [number, number] {
    const percent = total ? (count / total) * 100 : 0;
    return [count, percent];
  }

  private getCountAndPercent(summary: ExecutionSummaryDto, type: string): [number, number] {
    const count = summary?.distribution?.[type]?.count || 0;
    return this.calcPercent(count, summary?.count);
  }
}
