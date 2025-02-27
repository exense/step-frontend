import { inject, Injectable } from '@angular/core';
import { map, Observable, of, tap } from 'rxjs';
import { Mutable } from '../../basics/types/mutable';
import { Execution, ExecutionsService, UserService } from '../../../client/generated';
import { LOCAL_STORAGE } from '../../basics/types/storage.token';
import { ExecutionViewMode } from '../types/execution-view-mode';
import { switchMap } from 'rxjs/operators';
import { CommonEntitiesUrlsService } from '../../basics/injectables/common-entities-urls.service';
import { AppConfigContainerService } from '../../basics/injectables/app-config-container.service';

type FieldAccessor = Mutable<Pick<ExecutionViewModeService, 'forceLegacyReporting'>>;

@Injectable({
  providedIn: 'root',
})
export class ExecutionViewModeService {
  private _userService = inject(UserService);
  private _localStorage = inject(LOCAL_STORAGE);
  private _executionService = inject(ExecutionsService);
  private _commonEntitiesUrls = inject(CommonEntitiesUrlsService);
  private _serviceContext = inject(AppConfigContainerService);

  readonly forceLegacyReporting?: boolean;

  checkForceLegacyReporting(): Observable<boolean> {
    (this as FieldAccessor).forceLegacyReporting = this._serviceContext?.conf?.forceLegacyReporting;
    if (this.forceLegacyReporting) {
      return of(this._serviceContext?.conf?.forceLegacyReporting!);
    }
    return of(false);
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

  getExecutionMode(execution: Execution): Observable<ExecutionViewMode> {
    return this.checkForceLegacyReporting().pipe(
      tap((isForceLegacy) => console.log('isForceLegacy', isForceLegacy)),
      tap((isForceLegacy) => console.log('this.isLocalStorageForcingLegacy()', this.isLocalStorageForcingLegacy())),
      tap((isForceLegacy) =>
        console.log('this.isNewExecutionAvailable(execution)', this.isNewExecutionAvailable(execution)),
      ),
      map((isForceLegacy) =>
        this.isLocalStorageForcingLegacy() || !this.isNewExecutionAvailable(execution) || isForceLegacy
          ? ExecutionViewMode.LEGACY
          : ExecutionViewMode.NEW,
      ),
    );
  }

  isNewExecutionAvailable(execution: Execution): boolean {
    return execution.resolvedPlanRootNodeId !== null && execution.customFields?.['hasReportNodeTimeSeries'] === true;
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

  determineUrl(execution: Execution): Observable<string> {
    return this.getExecutionMode(execution).pipe(
      map((mode) =>
        mode === ExecutionViewMode.NEW
          ? this._commonEntitiesUrls.executionUrl(execution)
          : this._commonEntitiesUrls.legacyExecutionUrl(execution),
      ),
    );
  }

  cleanup(): void {
    (this as FieldAccessor).forceLegacyReporting = undefined;
  }
}
