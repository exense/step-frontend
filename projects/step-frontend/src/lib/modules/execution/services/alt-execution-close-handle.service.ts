import { inject, Injectable } from '@angular/core';
import { CommonEntitiesUrlsService, CustomMenuEntriesService, ExecutionCloseHandleService } from '@exense/step-core';
import { EXECUTION_ID } from './execution-id.token';
import { Router } from '@angular/router';

@Injectable()
export class AltExecutionCloseHandleService implements ExecutionCloseHandleService {
  private _executionId = inject(EXECUTION_ID);
  private _customMenuEntries = inject(CustomMenuEntriesService);
  private _commonEntitiesUrls = inject(CommonEntitiesUrlsService);
  private _router = inject(Router);

  closeExecution(): void {
    const executionId = this._executionId();
    let executionUrl = this._commonEntitiesUrls.executionUrl(executionId);
    if (executionUrl.startsWith('/')) {
      executionUrl = executionUrl.substring(1);
    }
    this._customMenuEntries.remove(executionUrl);
    this._router.navigate(['executions']);
  }
}
