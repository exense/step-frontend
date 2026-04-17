import { inject, Injectable } from '@angular/core';
import { AltExecutionStateService } from './alt-execution-state.service';
import { AltReportNodesSummaryStateService } from './alt-report-nodes-summary-state.service';
import { Execution, FetchBucketsRequest, ReportNode, TimeRange } from '@exense/step-core';
import { Observable } from 'rxjs';
import { KeywordParameters } from '../shared/keyword-parameters';

@Injectable()
export class AltKeywordNodesStateService extends AltReportNodesSummaryStateService<ReportNode> {
  constructor() {
    super(inject(AltExecutionStateService).keywordsDataSource$, 'keywords');
    this.tableParams$ = inject(AltExecutionStateService).keywordParameters$;
  }

  protected readonly statusDistributionViewId = 'statusDistributionForFunctionCalls';

  protected override createFetchBucketRequest(execution: Execution, timeRange: TimeRange): FetchBucketsRequest {
    return {
      start: timeRange.from,
      end: timeRange.to,
      numberOfBuckets: 1,
      oqlFilter: `(attributes.type = CallFunction) and (attributes.executionId = ${execution.id})`,
      groupDimensions: ['status'],
    };
  }

  readonly tableParams$: Observable<KeywordParameters>;
}
