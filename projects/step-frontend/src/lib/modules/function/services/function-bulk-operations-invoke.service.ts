import { Injectable } from '@angular/core';
import {
  AsyncOperationService,
  AsyncTaskStatus,
  AugmentedKeywordsService,
  BulkOperationParameters,
  BulkOperationsInvokeService,
} from '@exense/step-core';
import { Observable } from 'rxjs';

@Injectable()
export class FunctionBulkOperationsInvokeService extends BulkOperationsInvokeService<string> {
  constructor(_asyncOperationService: AsyncOperationService, private _api: AugmentedKeywordsService) {
    super(_asyncOperationService);
  }

  protected override invokeDelete(requestBody?: BulkOperationParameters): Observable<AsyncTaskStatus> {
    return this._api.deleteFunctions(requestBody);
  }

  protected override invokeDuplicate(requestBody?: BulkOperationParameters): Observable<AsyncTaskStatus> {
    return this._api.cloneFunctions(requestBody);
  }

  protected override invokeExport = undefined;
}
