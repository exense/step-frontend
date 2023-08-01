import {
  AsyncTaskStatus,
  TableBulkOperationRequest,
  BulkOperationsInvokeService,
  AugmentedExecutionsService,
} from '@exense/step-core';
import { Observable, of } from 'rxjs';
import { inject, Injectable } from '@angular/core';

@Injectable()
export class ExecutionBulkOperationsInvokeService extends BulkOperationsInvokeService<string> {
  protected _api = inject(AugmentedExecutionsService);

  protected override invokeDelete(requestBody?: TableBulkOperationRequest): Observable<AsyncTaskStatus> {
    return this._api.deleteExecutions(requestBody);
  }

  protected override invokeRestart(requestBody?: TableBulkOperationRequest): Observable<AsyncTaskStatus> {
    return this._api.startExecutions(requestBody);
  }

  protected override invokeStop(requestBody?: TableBulkOperationRequest): Observable<AsyncTaskStatus> {
    return this._api.stopExecutions(requestBody);
  }

  protected override invokeExport = undefined;
  protected override invokeDuplicate = undefined;
}
