import { inject, Injectable } from '@angular/core';
import {
  Execution,
  ExecutionsService,
  ExecutiontTaskParameters,
  Plan,
  PlansService,
  SchedulerService,
} from '@exense/step-core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TimeSeriesUtilityService {
  private _executionService = inject(ExecutionsService);
  private _planService = inject(PlansService);
  private _schedulerService = inject(SchedulerService);

  getExecutionByIds(ids: string[]): Observable<Execution[]> {
    return this._executionService.getExecutionsByIds(ids);
  }

  getTasksByIds(ids: string[]): Observable<ExecutiontTaskParameters[]> {
    return this._schedulerService.findExecutionTasksByIds(ids);
  }

  getPlansByIds(ids: string[]): Observable<Plan[]> {
    return this._planService.findPlansByIds(ids);
  }
}
