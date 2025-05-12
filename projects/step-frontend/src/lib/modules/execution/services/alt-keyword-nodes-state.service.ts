import { Injectable } from '@angular/core';
import { AltExecutionStateService } from './alt-execution-state.service';
import { AltReportNodesStateService } from './alt-report-nodes-state.service';
import { Execution, FetchBucketsRequest, TimeRange } from '@exense/step-core';

@Injectable()
export class AltKeywordNodesStateService extends AltReportNodesStateService {
  constructor(_executionState: AltExecutionStateService) {
    super(_executionState.keywordsDataSource$, 'keywords');
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
}
