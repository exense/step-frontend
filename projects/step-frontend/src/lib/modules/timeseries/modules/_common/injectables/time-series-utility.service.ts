import { inject, Injectable } from '@angular/core';
import {
  AugmentedExecutionsService,
  EntityDialogsService,
  Execution,
  ExecutionsService,
  ExecutiontTaskParameters,
  Plan,
  PlansService,
  SchedulerService,
} from '@exense/step-core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TimeSeriesUtilityService {
  private _executionService = inject(AugmentedExecutionsService);
  private _planService = inject(PlansService);
  private _schedulerService = inject(SchedulerService);

  getExecutions(ids: string[]): Observable<Execution[]> {
    return this._executionService.getExecutionsByIds(ids);
  }

  getPlans(ids: string[]): Observable<Plan[]> {
    return this._planService.findPlansByIds(ids);
  }

  getTasks(ids: string[]): Observable<ExecutiontTaskParameters[]> {
    return this._schedulerService.findExecutionTasksByIds(ids);
  }

  getEntitiesNamesByIds(ids: string[], entityType: string): Observable<Record<string, string>> {
    if (!ids || ids.length === 0) {
      return of({});
    }
    switch (entityType) {
      case 'execution':
        return this.getExecutionNames(ids);
      case 'plan':
        return this.getPlansNames(ids);
      case 'task':
        return this.getTasksNames(ids);
      default:
        throw new Error('Unhandled entity type: ' + entityType);
    }
  }

  private getExecutionNames(ids: string[]): Observable<Record<string, string>> {
    return this._executionService.getExecutionsNamesByIds(ids);
  }

  private getTasksNames(ids: string[]): Observable<Record<string, string>> {
    return this._schedulerService.findExecutionTaskNamesByIds(ids);
  }

  private getPlansNames(ids: string[]): Observable<Record<string, string>> {
    return this._planService.findPlanNamesByIds(ids);
  }
}
