import { Injectable } from '@angular/core';
import { AltReportNodesStateService } from './alt-report-nodes-state.service';
import { AltExecutionStateService } from './alt-execution-state.service';

@Injectable()
export class AltTestCasesNodesStateService extends AltReportNodesStateService {
  constructor(_executionState: AltExecutionStateService) {
    super(_executionState.testCasesDataSource$, 'statusDistributionForTestcases', 'testCases');
  }
}
