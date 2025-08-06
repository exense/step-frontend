import { map, Observable } from 'rxjs';
import { inject, Injectable, signal, Signal } from '@angular/core';
import { FilterBarItem, FilterBarItemType } from '../../../../timeseries/modules/_common';
import {
  CrossExecutionDashboardState,
  CrossExecutionViewType,
} from '../cross-execution-dashboard/cross-execution-dashboard-state';
import { Execution, TimeRange } from '@exense/step-core';
import { PLAN_ID } from '../../../services/plan-id.token';

@Injectable()
export class PlanPageStateService extends CrossExecutionDashboardState {
  readonly _planIdFn = inject(PLAN_ID);
  viewType: Signal<CrossExecutionViewType> = signal('plan');

  getViewType(): CrossExecutionViewType {
    return 'plan';
  }

  getDashboardFilter(): FilterBarItem {
    return {
      attributeName: 'planId',
      type: FilterBarItemType.TASK,
      searchEntities: [{ searchValue: this._planIdFn() }],
    };
  }

  fetchLastExecution(): Observable<Execution> {
    return this._executionService
      .findByCritera({
        criteria: { planId: this._planIdFn() },
        limit: 1,
      })
      .pipe(map((executions) => executions[0]));
  }

  fetchLastExecutions(timeRange: TimeRange): Observable<Execution[]> {
    return this._executionService.findByCritera({
      criteria: { planId: this._planIdFn() },
      limit: 30,
      start: timeRange.from.toString(),
      end: timeRange.to.toString(),
    });
  }
}
