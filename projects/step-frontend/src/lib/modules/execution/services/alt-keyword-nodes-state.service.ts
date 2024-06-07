import { Injectable } from '@angular/core';
import { AltExecutionStateService } from './alt-execution-state.service';
import { AltReportNodesStateService } from './alt-report-nodes-state.service';

@Injectable()
export class AltKeywordNodesStateService extends AltReportNodesStateService {
  constructor(_executionState: AltExecutionStateService) {
    super(_executionState.keywordsDataSource$, 'statusDistributionForFunctionCalls', 'keywords');
  }
}
