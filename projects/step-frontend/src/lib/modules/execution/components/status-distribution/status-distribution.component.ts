import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ExecutionSummaryDto } from '@exense/step-core';

@Component({
  selector: 'step-status-distribution',
  templateUrl: './status-distribution.component.html',
  styleUrls: ['./status-distribution.component.scss'],
})
export class StatusDistributionComponent implements OnChanges {
  @Input() summary?: ExecutionSummaryDto;

  passed: number = 0;
  failed: number = 0;
  techError: number = 0;

  percentPassed: number = 0;
  percentFailed: number = 0;
  percentTechError: number = 0;

  tooltipMessage: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    const cSummary = changes['summary'];
    if (cSummary?.currentValue === cSummary?.previousValue) {
      return;
    }

    const summary = cSummary.currentValue as ExecutionSummaryDto;

    [this.passed, this.percentPassed] = this.getCountAndPercent(summary, 'PASSED');
    [this.failed, this.percentFailed] = this.getCountAndPercent(summary, 'FAILED');
    [this.techError, this.percentTechError] = this.getCountAndPercent(summary, 'TECHNICAL_ERROR');

    this.tooltipMessage = `${summary?.label || ''} PASSED: ${this.passed}, FAILED: ${this.failed}, TECHNICAL_ERROR: ${
      this.techError
    }`;
  }

  private getCountAndPercent(summary: ExecutionSummaryDto, type: string): [number, number] {
    const count = summary?.distribution?.[type]?.count || 0;
    const percent = summary?.count ? (count / summary.count) * 100 : 0;
    return [count, percent];
  }
}
