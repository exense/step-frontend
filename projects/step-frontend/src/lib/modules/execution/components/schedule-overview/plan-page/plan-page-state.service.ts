import { map, Observable, of } from 'rxjs';
import { inject, Injectable, signal, Signal } from '@angular/core';
import { FilterBarItem, FilterBarItemType } from '../../../../timeseries/modules/_common';
import {
  CrossExecutionDashboardState,
  CrossExecutionViewType,
} from '../cross-execution-dashboard/cross-execution-dashboard-state';
import { Execution, SearchValue, TimeRange } from '@exense/step-core';
import { PLAN_ID } from '../../../services/plan-id.token';

@Injectable()
export class PlanPageStateService extends CrossExecutionDashboardState {
  readonly _planIdFn = inject(PLAN_ID);
  viewType: Signal<CrossExecutionViewType> = signal('plan');

  readonly executionsTableFilter: Record<string, SearchValue> = { planId: this._planIdFn() };

  getViewType(): CrossExecutionViewType {
    return 'plan';
  }

  getEntityId(): string {
    return this._planIdFn();
  }

  getDashboardFilter(): string {
    const planId = this._planIdFn();
    return `(attributes.planId = \"${planId}\" or attributes.canonicalPlanName = \"${planId}\")`;
  }

  fetchLastExecution(): Observable<Execution> {
    return this._executionService.getLastExecutionsByPlan(this._planIdFn(), 1).pipe(map(list => list[0]));
  }

  fetchLastExecutions(timeRange: TimeRange): Observable<Execution[]> {
    return this._executionService.getLastExecutionsByPlan(this._planIdFn(), 30, timeRange.from, timeRange.to);
  }
}
