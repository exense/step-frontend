import { inject, Injectable } from '@angular/core';
import {
  AsyncTaskStatus,
  AugmentedKeywordsService,
  BulkOperationsInvokeService,
  TableBulkOperationRequest,
} from '@exense/step-core';
import { Observable } from 'rxjs';

@Injectable()
export class GenericFunctionBulkOperationsInvokeService extends BulkOperationsInvokeService<string> {
  protected _api = inject(AugmentedKeywordsService);

  protected override invokeDelete?(requestBody?: TableBulkOperationRequest): Observable<AsyncTaskStatus> {
    return this._api.deleteFunctions(requestBody);
  }

  protected override invokeDuplicate?(requestBody?: TableBulkOperationRequest): Observable<AsyncTaskStatus> {
    return this._api.cloneFunctions(requestBody);
  }

  protected override invokeExport = undefined;
  protected override invokeStart = undefined;
  protected override invokeStop = undefined;
}
