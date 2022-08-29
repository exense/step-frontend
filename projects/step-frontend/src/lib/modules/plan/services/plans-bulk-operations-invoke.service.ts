import { Injectable } from '@angular/core';
import {
  AsyncTasksService,
  AsyncTaskStatusVoid,
  BulkOperationParameters,
  BulkOperationsInvokeService,
  DialogsService,
  PlansService,
} from '@exense/step-core';
import { Observable } from 'rxjs';

@Injectable()
export class PlansBulkOperationsInvokeService extends BulkOperationsInvokeService<string> {
  constructor(_asyncService: AsyncTasksService, _dialogs: DialogsService, protected _plans: PlansService) {
    super(_asyncService, _dialogs);
  }

  protected override invokeDelete(requestBody?: BulkOperationParameters): Observable<AsyncTaskStatusVoid> {
    return this._plans.deletePlans(requestBody);
  }
  protected override invokeDuplicate(requestBody?: BulkOperationParameters): Observable<AsyncTaskStatusVoid> {
    return this._plans.clonePlans(requestBody);
  }

  protected override invokeExport = undefined;
}
