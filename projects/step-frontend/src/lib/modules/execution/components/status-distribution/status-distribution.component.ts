import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ExecutionSummaryDto } from '@exense/step-core';

@Component({
  selector: 'step-status-distribution',
  templateUrl: './status-distribution.component.html',
  styleUrls: ['./status-distribution.component.scss'],
})
export class StatusDistributionComponent implements OnChanges {
  @Input() summary?: ExecutionSummaryDto;
  @Input() isProgress: boolean = false;

  passed: number = 0;
  failed: number = 0;
  techError: number = 0;
  count: number = 0;

  percentPassed: number = 0;
  percentFailed: number = 0;
  percentTechError: number = 0;
  countPercent: number = 0;

  tooltipMessage: string = '';
  tooltipProgressMessage: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    const cSummary = changes['summary'];
    if (cSummary?.currentValue === cSummary?.previousValue) {
      return;
    }

    const summary = cSummary.currentValue as ExecutionSummaryDto;

    [this.passed, this.percentPassed] = this.getCountAndPercent(summary, 'PASSED');
    if (!this.isProgress && summary?.count === 0) {
      this.percentPassed = 100; // show a green bar if there have been zero keyword calls on completion
    }
    [this.failed, this.percentFailed] = this.getCountAndPercent(summary, 'FAILED');
    [this.techError, this.percentTechError] = this.getCountAndPercent(summary, 'TECHNICAL_ERROR');
    [this.count, this.countPercent] = this.calcPercent(summary?.count, summary?.countForecast);

    this.tooltipMessage = `${summary?.label || ''} PASSED: ${this.passed}, FAILED: ${this.failed}, TECHNICAL_ERROR: ${
      this.techError
    }`;

    this.tooltipProgressMessage = `Progress: ${summary?.count || 0}/${summary?.countForecast || 0}`;
  }

  private calcPercent(count: number, total: number): [number, number] {
    const percent = total ? (count / total) * 100 : 0;
    return [count, percent];
  }

  private getCountAndPercent(summary: ExecutionSummaryDto, type: string): [number, number] {
    const count = summary?.distribution?.[type]?.count || 0;
    return this.calcPercent(count, summary?.count);
  }
}
