import { inject, Injectable } from '@angular/core';
import { AltReportNodesSummaryStateService } from './alt-report-nodes-summary-state.service';
import { AltExecutionStateService } from './alt-execution-state.service';
import { AggregatedReportView, Execution, FetchBucketsRequest, ReportNode, TimeRange } from '@exense/step-core';
import { of } from 'rxjs';

@Injectable()
export class AltTestCasesNodesStateService extends AltReportNodesSummaryStateService<
  AggregatedReportView | ReportNode
> {
  constructor() {
    super(inject(AltExecutionStateService).testCasesDataSource$, 'testCases');
  }

  protected readonly statusDistributionViewId = 'statusDistributionForTestcases';

  protected override createFetchBucketRequest(execution: Execution, timeRange: TimeRange): FetchBucketsRequest {
    return {
      start: timeRange.from,
      end: timeRange.to,
      numberOfBuckets: 1,
      oqlFilter: `(attributes.type = TestCase) and (attributes.executionId = ${execution.id})`,
      groupDimensions: ['status'],
    };
  }

  readonly tableParams$ = of(undefined);
}
