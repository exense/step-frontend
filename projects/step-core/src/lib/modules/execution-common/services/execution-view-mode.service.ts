import { inject, Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { Mutable, LOCAL_STORAGE, CommonEntitiesUrlsService } from '../../basics/step-basics.module';
import { Execution, AppConfigContainerService } from '../../../client/step-client-module';
import { ExecutionViewMode } from '../types/execution-view-mode';

type FieldAccessor = Mutable<Pick<ExecutionViewModeService, 'forceLegacyReporting'>>;

@Injectable({
  providedIn: 'root',
})
export class ExecutionViewModeService {
  private _localStorage = inject(LOCAL_STORAGE);
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

  getExecutionMode(execution: Execution): Observable<ExecutionViewMode> {
    return this.checkForceLegacyReporting().pipe(
      map((isForceLegacy) =>
        this.isLocalStorageForcingLegacy() || !this.isNewExecutionAvailable(execution) || isForceLegacy
          ? ExecutionViewMode.LEGACY
          : ExecutionViewMode.NEW,
      ),
    );
  }

  isNewExecutionAvailable(execution: Execution): boolean {
    return (
      execution.status !== 'ENDED' ||
      execution.result === 'VETOED' ||
      execution.result === 'IMPORT_ERROR' ||
      (execution.resolvedPlanRootNodeId !== null && execution.customFields?.['hasReportNodeTimeSeries'] === true)
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
