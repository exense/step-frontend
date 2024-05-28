import { inject, Injectable } from '@angular/core';
import { ReportNode, TimeRange } from '@exense/step-core';
import { ReportNodeSummary } from '../shared/report-node-summary';
import { map, startWith } from 'rxjs';
import { AltExecutionStateService } from './alt-execution-state.service';
import { FormBuilder } from '@angular/forms';

type ReportNodeStatus = ReportNode['status'];

@Injectable()
export class AltExecutionReportStateService {
  private _fb = inject(FormBuilder);
  private _executionState = inject(AltExecutionStateService);

  readonly keywordsSummary$ = this._executionState.keywords$.pipe(map((keywords) => this.createSummary(keywords)));
  readonly keywordsStatuses$ = this._executionState.keywords$.pipe(
    map((keywords) => this.getAvailableStatuses(keywords)),
  );
  readonly keywordsShowNonPassedFilterBtn$ = this.keywordsStatuses$.pipe(
    map((statuses) => this.determineNonPassedFilterBtnVisibility(statuses)),
  );
  readonly keywordsStatusesCtrl = this._fb.control<ReportNodeStatus[]>([]);

  readonly testCasesSummary$ = this._executionState.testCases$.pipe(map((testCases) => this.createSummary(testCases)));
  readonly testCasesStatuses$ = this._executionState.testCases$.pipe(
    map((testCases) => this.getAvailableStatuses(testCases)),
  );
  readonly testCasesShowNonPassedFilterBtn$ = this.testCasesStatuses$.pipe(
    map((statuses) => this.determineNonPassedFilterBtnVisibility(statuses)),
  );
  readonly testCasesCtrl = this._fb.control<ReportNodeStatus[]>([]);

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

  private getAvailableStatuses(reportNodes?: ReportNode[]): ReportNodeStatus[] {
    const statuses = (reportNodes ?? []).map((node) => node.status);
    return Array.from(new Set(statuses));
  }

  private determineNonPassedFilterBtnVisibility(statuses: ReportNodeStatus[]): boolean {
    return statuses.includes('PASSED') && statuses.length > 0;
  }
}
