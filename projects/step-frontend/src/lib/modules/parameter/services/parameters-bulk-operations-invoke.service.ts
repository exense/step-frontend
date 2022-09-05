import {
  AsyncOperationService,
  AsyncTaskStatus,
  AugmentedParametersService,
  BulkOperationParameters,
  BulkOperationsInvokeService,
} from '@exense/step-core';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export class ParametersBulkOperationsInvokeService extends BulkOperationsInvokeService<string> {
  protected override invokeExport = undefined;

  constructor(_asyncService: AsyncOperationService, protected _api: AugmentedParametersService) {
    super(_asyncService);
  }

  protected override invokeDelete(requestBody?: BulkOperationParameters): Observable<AsyncTaskStatus> {
    return this._api.deleteParameters(requestBody);
  }

  protected override invokeDuplicate(requestBody?: BulkOperationParameters): Observable<AsyncTaskStatus> {
    return this._api.cloneParameters(requestBody);
  }
}
