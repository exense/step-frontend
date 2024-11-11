import { Injectable, signal } from '@angular/core';
import { AltExecutionStateService } from './alt-execution-state.service';
import { AltReportNodesStateService } from './alt-report-nodes-state.service';
import { ReportNode } from '@exense/step-core';

@Injectable()
export class AltKeywordNodesStateService extends AltReportNodesStateService {
  constructor(_executionState: AltExecutionStateService) {
    super(_executionState.keywordsDataSource$, 'statusDistributionForFunctionCalls', 'keywords');
  }

  private visibleDetailsInternal = signal<Record<string, boolean>>({});

  readonly visibleDetails = this.visibleDetailsInternal.asReadonly();

  toggleDetail(node: ReportNode): void {
    const isVisible = !!this.visibleDetailsInternal()[node.id!];
    this.visibleDetailsInternal.update((value) => ({
      ...value,
      [node.id!]: !isVisible,
    }));
  }
}
