import {
  AsyncOperationService,
  AsyncTaskStatusVoid,
  AugmentedSchedulerService,
  BulkOperationParameters,
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

  protected override invokeDelete(requestBody?: BulkOperationParameters): Observable<AsyncTaskStatusVoid> {
    return this._api.deleteExecutionTasks(requestBody);
  }

  protected override invokeDuplicate(requestBody?: BulkOperationParameters): Observable<AsyncTaskStatusVoid> {
    return this._api.cloneExecutionTasks(requestBody);
  }
}
