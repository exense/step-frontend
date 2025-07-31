import { map, Observable } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { SCHEDULE_ID } from '../../../services/schedule-id.token';
import { FilterBarItem, FilterBarItemType } from '../../../../timeseries/modules/_common';
import {
  CrossExecutionDashboardState,
  CrossExecutionViewType,
} from '../cross-execution-dashboard/cross-execution-dashboard-state';
import { Execution, SearchValue, TimeRange } from '@exense/step-core';

@Injectable()
export class SchedulerPageStateService extends CrossExecutionDashboardState {
  readonly _taskIdFn = inject(SCHEDULE_ID);

  readonly executionsTableFilter: Record<string, string | string[] | SearchValue> = {
    executionTaskID: this._taskIdFn(),
  };

  getViewType(): CrossExecutionViewType {
    return 'task';
  }

  getDashboardFilter(): FilterBarItem {
    return {
      attributeName: 'taskId',
      type: FilterBarItemType.TASK,
      searchEntities: [{ searchValue: this._taskIdFn() }],
    };
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
