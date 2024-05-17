import { Component, inject } from '@angular/core';
import { map, startWith } from 'rxjs';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { ReportNodeSummary } from '../../shared/report-node-summary';
import { IS_SMALL_SCREEN, ReportNode, TimeRange } from '@exense/step-core';

@Component({
  selector: 'step-alt-execution-report',
  templateUrl: './alt-execution-report.component.html',
  styleUrl: './alt-execution-report.component.scss',
})
export class AltExecutionReportComponent {
  readonly _state = inject(AltExecutionStateService);

  readonly _isSmallScreen$ = inject(IS_SMALL_SCREEN);

  readonly keywordsSummary$ = this._state.keywords$.pipe(map((keywords) => this.createSummary(keywords)));

  readonly testCasesSummary$ = this._state.testCases$.pipe(map((testCases) => this.createSummary(testCases)));

  readonly timeRange$ = this._state.dateRangeCtrl.valueChanges.pipe(
    startWith(this._state.dateRangeCtrl.value),
    map((dateRange) => {
      if (!dateRange) {
        return undefined;
      }
      const from = dateRange.start!.toMillis();
      const to = dateRange.end!.toMillis();
      if (from >= to) {
        return undefined;
      }
      return { from, to } as TimeRange;
    }),
  );

  private createSummary(reportNodes?: ReportNode[]): ReportNodeSummary | undefined {
    if (!reportNodes) {
      return undefined;
    }
    const summary = reportNodes.reduce(
      (res, keyword) => {
        if (keyword.status === 'PASSED') res.passed++;
        if (keyword.status === 'FAILED') res.failed++;
        if (keyword.status === 'TECHNICAL_ERROR') res.techError++;
        if (keyword.status === 'RUNNING') res.running++;
        return res;
      },
      { passed: 0, failed: 0, techError: 0, running: 0, total: 0 } as ReportNodeSummary,
    );
    summary.total = summary.passed + summary.failed + summary.techError + summary.running;
    return summary;
  }
}
