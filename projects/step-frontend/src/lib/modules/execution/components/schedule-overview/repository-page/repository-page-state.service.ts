import { CrossExecutionDashboardState, CrossExecutionViewType } from '../cross-execution-dashboard/cross-execution-dashboard-state';
import { Execution, SearchValue, TimeRange } from '@exense/step-core';
import { inject, signal, Signal } from '@angular/core';
import { map, Observable } from 'rxjs';
import { EXECUTION_ID } from '../../../services/execution-id.token';

export class RepositoryPageStateService extends CrossExecutionDashboardState {
  readonly _executionIdFn = inject(EXECUTION_ID);
  readonly viewType: Signal<CrossExecutionViewType> = signal('repository');

  readonly executionsTableFilter: Record<string, SearchValue> = { planId: this._executionIdFn() };

  getViewType(): CrossExecutionViewType {
    return 'plan';
  }

  getEntityId(): string {
    return this._executionIdFn();
  }

  getDashboardFilter(): string {
    let execution = this.execution();
    if (!execution) {
      throw new Error("Execution is not already fetched");
    }
    const canonicalPlanName = execution.importResult?.canonicalPlanName!;
    // TODO handle no canonicalPlan
    return `(attributes.planId = \"${execution.planId}\" or attributes.canonicalPlanName = \"${canonicalPlanName}\")`;
  }

  fetchLastExecution(): Observable<Execution> {
    return this._executionService.getLastExecutionsByPlan(this._executionIdFn(), 1).pipe(map((list) => list[0]));
  }

  fetchLastExecutions(timeRange: TimeRange): Observable<Execution[]> {
    return this._executionService.getLastExecutionsByPlan(this._executionIdFn(), 30, timeRange.from, timeRange.to);
  }
}
