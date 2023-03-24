import {
  AsyncOperationService,
  AsyncTaskStatus,
  AugmentedParametersService,
  TableBulkOperationRequest,
  BulkOperationsInvokeService,
} from '@exense/step-core';
import { Observable } from 'rxjs';
import { inject, Injectable } from '@angular/core';

@Injectable()
export class ParametersBulkOperationsInvokeService extends BulkOperationsInvokeService<string> {
  protected override invokeExport = undefined;

  protected _api = inject(AugmentedParametersService);

  protected override invokeDelete(requestBody?: TableBulkOperationRequest): Observable<AsyncTaskStatus> {
    return this._api.deleteParameters(requestBody);
  }

  protected override invokeDuplicate(requestBody?: TableBulkOperationRequest): Observable<AsyncTaskStatus> {
    return this._api.cloneParameters(requestBody);
  }
}
