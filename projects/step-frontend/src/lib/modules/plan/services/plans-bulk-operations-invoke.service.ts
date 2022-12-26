import { Injectable } from '@angular/core';
import {
  AsyncOperationService,
  AsyncTaskStatus,
  TableBulkOperationRequest,
  BulkOperationsInvokeService,
  PlansService,
} from '@exense/step-core';
import { Observable } from 'rxjs';

@Injectable()
export class PlansBulkOperationsInvokeService extends BulkOperationsInvokeService<string> {
  constructor(_asyncService: AsyncOperationService, protected _plans: PlansService) {
    super(_asyncService);
  }

  protected override invokeDelete(requestBody?: TableBulkOperationRequest): Observable<AsyncTaskStatus> {
    return this._plans.deletePlans(requestBody);
  }
  protected override invokeDuplicate(requestBody?: TableBulkOperationRequest): Observable<AsyncTaskStatus> {
    return this._plans.clonePlans(requestBody);
  }

  protected override invokeExport = undefined;
}
