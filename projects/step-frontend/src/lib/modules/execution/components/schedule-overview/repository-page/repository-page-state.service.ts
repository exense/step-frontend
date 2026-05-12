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

  dashboardDisabledFilters: string[] = ['planId'];

  readonly executionsTableFilters = computed(() => {
    const execution = this.getExecutionOrThrow();
    const canonicalPlanName = this.getCanonicalPlanNameOrThrow();

    return {
      planIdOrCanonicalPlanName: this._filterConditionFactory.matchAnyFilterCondition({
        planId: execution.planId!,
        'importResult.canonicalPlanName': canonicalPlanName,
      }),
    } as Record<string, SearchValue>;
  });

  getViewType(): CrossExecutionViewType {
    return 'repository';
  }

  getEntityId(): string {
    return this._executionIdFn();
  }

  getDashboardFilter(): string {
    const execution = this.getExecutionOrThrow();
    const canonicalPlanName = this.getCanonicalPlanNameOrThrow();
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
    return this._executionService.searchByCanonicalPlanName(this.getCanonicalPlanNameOrThrow());
  }

  private getExecutionOrThrow(): Execution {
    const execution = this.execution();
    if (!execution) {
      throw new Error('Execution is not yet fetched');
    }

    return execution;
  }

  private getCanonicalPlanNameOrThrow(): string {
    const canonicalPlanName = this.getExecutionOrThrow().importResult?.canonicalPlanName;
    if (!canonicalPlanName) {
      throw new Error('Execution canonical plan name is not available');
    }

    return canonicalPlanName;
  }
}
