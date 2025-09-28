import { Component, computed, effect, inject, input, ViewEncapsulation } from '@angular/core';
import { AggregatedTreeNode } from '../../shared/aggregated-tree-node';
import { Execution, ExecutionsService } from '@exense/step-core';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { map, Observable, switchMap, take } from 'rxjs';

const LAST_EXECUTIONS_TO_DISPLAY = 8;

interface PieChartData {
  label: string;
}

@Component({
  selector: 'step-aggregated-tree-node-history',
  templateUrl: './aggregated-tree-node-history.component.html',
  styleUrl: './aggregated-tree-node-history.component.scss',
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class AggregatedTreeNodeHistoryComponent {
  readonly node = input.required<AggregatedTreeNode>();
  protected _executionService = inject(ExecutionsService);
  private _executionState = inject(AltExecutionStateService);

  lastExecutions = this._executionState.execution$.pipe(
    take(1),
    switchMap((ex) =>
      (ex.executionTaskID
        ? this.fetchLastExecutionsByTask(ex.startTime!, ex.executionTaskID)
        : this.fetchLastExecutionsByPlan(ex.startTime!, ex.planId!)
      ).pipe(map((lastExecutions) => [ex, ...lastExecutions].reverse())),
    ),
  );

  private fetchLastExecutionsByPlan(beforeTime: number, planId: string): Observable<Execution[]> {
    return this._executionService.findByCritera({
      criteria: { planId: planId },
      limit: LAST_EXECUTIONS_TO_DISPLAY,
      start: '0',
      end: beforeTime.toString(),
    });
  }

  private fetchLastExecutionsByTask(beforeTime: number, taskId: string): Observable<Execution[]> {
    return this._executionService.getLastExecutionsByTaskId(taskId, LAST_EXECUTIONS_TO_DISPLAY, 0, beforeTime);
  }
}
