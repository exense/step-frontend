import { CrossExecutionDashboardState, CrossExecutionViewType } from '../cross-execution-dashboard/cross-execution-dashboard-state';
import { Execution, FilterConditionFactoryService, SearchValue, TimeRange } from '@exense/step-core';
import { computed, inject, signal, Signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, Observable, of, take } from 'rxjs';
import { EXECUTION_ID } from '../../../services/execution-id.token';

export class RepositoryPageStateService extends CrossExecutionDashboardState {
  readonly _executionIdFn = inject(EXECUTION_ID);
  readonly _filterConditionFactory = inject(FilterConditionFactoryService);
  readonly viewType: Signal<CrossExecutionViewType> = signal('repository');

  // readonly executionsTableFilter: Record<string, SearchValue> = { planId: this._executionIdFn() };

  readonly executionsTableFilters = computed(() => {
    let execution = this.execution();
    const canonicalPlanName = execution!.importResult!.canonicalPlanName!;
    if (execution) {
      return {
        planIdOrCanonicalPlanName: this._filterConditionFactory.matchAnyFilterCondition({
          planId: execution.planId!,
          'importResult.canonicalPlanName': canonicalPlanName,
        }),
      } as Record<string, SearchValue>;
    } else {
      return {};
    }
  });

  getViewType(): CrossExecutionViewType {
    return 'plan';
  }

  getEntityId(): string {
    return this._executionIdFn();
  }

  getDashboardFilter(): string {
    let execution = this.execution();
    if (!execution) {
      throw new Error('Execution is not already fetched');
    }
    const canonicalPlanName = execution.importResult?.canonicalPlanName!;
    // TODO handle no canonicalPlan
    return `(attributes.planId = \"${execution.planId}\" or attributes.canonicalPlanName = \"${canonicalPlanName}\")`;
  }

  fetchLastExecution(): Observable<Execution> {
    const execution = this.execution();
    if (execution) {
      return of(execution);
    }

    return toObservable(this.execution).pipe(
      filter((value): value is Execution => value != null),
      take(1),
    );
  }

  fetchLastExecutions(timeRange: TimeRange): Observable<Execution[]> {
    return this._executionService.getLastExecutionsByPlan(this._executionIdFn(), 30, timeRange.from, timeRange.to);
  }
}
