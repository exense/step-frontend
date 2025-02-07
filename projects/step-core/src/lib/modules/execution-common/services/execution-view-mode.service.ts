import { inject, Injectable, Provider } from '@angular/core';
import { map, Observable, of, tap } from 'rxjs';
import { Mutable } from '../../basics/types/mutable';
import { Execution, ExecutionsService, UserService } from '../../../client/generated';
import { LOCAL_STORAGE } from '../../basics/types/storage.token';
import { ExecutionViewMode } from '../types/execution-view-mode';
import { EXECUTION_VIEW_MODE } from '../injectables/execution-view-mode.token';
import { switchMap } from 'rxjs/operators';
import { CommonEntitiesUrlsService } from '../../basics/injectables/common-entities-urls.service';

type FieldAccessor = Mutable<Pick<ExecutionViewModeService, 'mode'>>;

@Injectable({
  providedIn: 'root',
})
export class ExecutionViewModeService {
  private _userService = inject(UserService);
  private _localStorage = inject(LOCAL_STORAGE);
  private _executionService = inject(ExecutionsService);
  private _commonEntitiesUrls = inject(CommonEntitiesUrlsService);

  readonly mode?: ExecutionViewMode;

  loadExecutionMode(): Observable<ExecutionViewMode> {
    if (this.mode) {
      return of(this.mode);
    }
    return this._userService.getPreferences().pipe(
      map((preferences) => preferences?.preferences?.['forceLegacyReporting'] === 'true'),
      map((forceLegacyReporting) => (forceLegacyReporting ? ExecutionViewMode.LEGACY : ExecutionViewMode.NEW)),
      tap((mode) => ((this as FieldAccessor).mode = mode)),
    );
  }

  public resolveExecution(idOrExecution: string | Execution): Observable<Execution> {
    if (typeof idOrExecution !== 'string') {
      return of(idOrExecution);
    }

    return this._executionService.getExecutionById(idOrExecution).pipe(
      switchMap((execution) => {
        if (!execution) {
          throw new Error(`Execution with ID ${idOrExecution} not found`);
        }
        return of(execution);
      }),
    );
  }

  getExecutionMode(execution: Execution): ExecutionViewMode {
    return this.isLocalStorageForcingLegacy() || !this.isNewExecutionAvailable(execution)
      ? ExecutionViewMode.LEGACY
      : ExecutionViewMode.NEW;
  }

  isNewExecutionAvailable(execution: Execution): boolean {
    return (
      execution.resolvedPlanRootNodeId !== undefined &&
      execution.customFields?.['hasReportNodeTimeSeries'] === true &&
      execution.description !== 'LegacyPlan'
    );
  }

  getNewExecutionDeactivatedReason(execution: Execution): string {
    if (execution.customFields?.['hasReportNodeTimeSeries'] == null) {
      return 'The Execution Report Beta view is only available for Executions started in Step 27 or later.';
    }

    if (!execution.customFields?.['hasReportNodeTimeSeries']) {
      return 'The Execution Report Beta requires report node collection in the TimeSeries.';
    }

    if (!execution.resolvedPlanRootNodeId) {
      return 'The Execution Report Beta requires report node aggregation.';
    }

    if (execution.description === 'LegacyPlan') {
      return 'The Execution Report Beta is disabled for plans called "LegacyPlan".';
    }

    return 'The Execution Report Beta view is not available.';
  }

  isLocalStorageForcingLegacy(): boolean {
    return this._localStorage.getItem('executionViewMode') === 'legacyExecution';
  }

  setForceLegacyView(forceLegacy: boolean): void {
    this._localStorage.setItem('executionViewMode', forceLegacy ? 'legacyExecution' : 'newExecution');
  }

  determineUrl(execution: Execution): string {
    const mode = this.getExecutionMode(execution);
    return mode === ExecutionViewMode.NEW
      ? this._commonEntitiesUrls.executionUrl(execution)
      : this._commonEntitiesUrls.legacyExecutionUrl(execution);
  }

  cleanup(): void {
    (this as FieldAccessor).mode = undefined;
  }
}

export const provideExecutionViewMode = (): Provider[] => [
  {
    provide: EXECUTION_VIEW_MODE,
    useFactory: () => inject(ExecutionViewModeService).mode ?? ExecutionViewMode.LEGACY,
  },
];
