import { map, Observable, shareReplay, switchMap } from 'rxjs';
import { inject } from '@angular/core';
import { SCHEDULE_ID } from '../../../services/schedule-id.token';
import { FilterBarItem, FilterBarItemType } from '../../../../timeseries/modules/_common';
import {
  CrossExecutionDashboardState,
  CrossExecutionViewType,
} from '../cross-execution-dashboard/cross-execution-dashboard-state';
import { Execution, TimeRange } from '@exense/step-core';

export class SchedulerPageStateService extends CrossExecutionDashboardState {
  readonly LAST_EXECUTIONS_TO_DISPLAY = 30;

  readonly _taskIdFn = inject(SCHEDULE_ID);

  getViewType(): CrossExecutionViewType {
    return 'task';
  }

  override lastExecutionsSorted$ = this.timeRange$.pipe(
    switchMap((timeRange) => {
      let taskId = this._taskIdFn();
      return this._executionService
        .getLastExecutionsByTaskId(taskId, this.LAST_EXECUTIONS_TO_DISPLAY, timeRange.from, timeRange.to)
        .pipe(
          map((executions) => {
            executions.sort((a, b) => a.startTime! - b.startTime!);
            return executions;
          }),
        );
    }),
    shareReplay(1),
  );

  getDashboardFilters(): FilterBarItem[] {
    return [
      { attributeName: 'taskId', type: FilterBarItemType.TASK, searchEntities: [{ searchValue: this._taskIdFn() }] },
    ];
  }

  fetchLastExecution(): Observable<Execution> {
    return this._executionService
      .getLastExecutionsByTaskId(this._taskIdFn(), 1, undefined, undefined)
      .pipe(map((exec) => exec[0]));
  }

  fetchLastExecutions(timeRange: TimeRange): Observable<Execution[]> {
    return this._executionService.getLastExecutionsByTaskId(
      this._taskIdFn(),
      this.LAST_EXECUTIONS_TO_DISPLAY,
      timeRange.from,
      timeRange.to,
    );
  }
}
