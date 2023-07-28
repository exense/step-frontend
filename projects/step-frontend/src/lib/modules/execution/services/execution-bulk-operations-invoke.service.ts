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
    return this._api.startEntityS(requestBody);
  }

  protected override invokeStop(requestBody?: TableBulkOperationRequest): Observable<AsyncTaskStatus> {
    return this._api.cloneEntityS1(requestBody);
  }

  protected override invokeExport = undefined;
  protected override invokeDuplicate = undefined;
}
