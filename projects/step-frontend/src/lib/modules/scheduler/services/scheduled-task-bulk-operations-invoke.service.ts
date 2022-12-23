import {
  AsyncOperationService,
  AsyncTaskStatus,
  AugmentedSchedulerService,
  TableBulkOperationRequest,
  BulkOperationsInvokeService,
} from '@exense/step-core';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export class ScheduledTaskBulkOperationsInvokeService extends BulkOperationsInvokeService<string> {
  protected invokeExport = undefined;

  constructor(_asyncTask: AsyncOperationService, protected _api: AugmentedSchedulerService) {
    super(_asyncTask);
  }

  protected override invokeDelete(requestBody?: TableBulkOperationRequest): Observable<AsyncTaskStatus> {
    return this._api.deleteExecutionTasks(requestBody);
  }

  protected override invokeDuplicate(requestBody?: TableBulkOperationRequest): Observable<AsyncTaskStatus> {
    return this._api.cloneExecutionTasks(requestBody);
  }
}
