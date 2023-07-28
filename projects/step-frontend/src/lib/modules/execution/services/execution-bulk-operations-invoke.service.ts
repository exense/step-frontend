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
    //FIXME: use new API
    console.log('invokeDelete', requestBody);
    return this._api.deleteExecution('test');
  }

  protected override invokeStart(requestBody?: TableBulkOperationRequest): Observable<AsyncTaskStatus> {
    //FIXME: use new API
    console.log('invokeStart', requestBody);
    return this._api.deleteExecution('test');
  }

  protected override invokeStop(requestBody?: TableBulkOperationRequest): Observable<AsyncTaskStatus> {
    //FIXME: use new API
    console.log('invokeStop', requestBody);
    return this._api.deleteExecution('test');
  }

  protected override invokeExport = undefined;
  protected override invokeDuplicate = undefined;
}
