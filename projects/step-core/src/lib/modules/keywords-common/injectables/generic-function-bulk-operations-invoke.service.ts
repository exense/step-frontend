import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BulkOperationsInvokeService } from '../../table/table.module';
import {
  AsyncTaskStatus,
  AugmentedKeywordsService,
  TableBulkOperationRequest,
} from '../../../client/step-client-module';

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
  protected override invokeRestart = undefined;
  protected override invokeStop = undefined;
}
