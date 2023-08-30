import { Observable, of } from 'rxjs';
import { BulkOperationConfig, BulkOperationPerformStrategy } from '../../entities-selection/entities-selection.module';
import { AsyncOperationDialogResult } from '../../async-operations/async-operations.module';
import { inject, Injectable, Injector } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BulkOperationsInvokeService<ID = string> {
  private _injector = inject(Injector);

  invoke(config: BulkOperationConfig<ID>): Observable<AsyncOperationDialogResult | undefined> {
    const operation = config.operationInfo?.operation;

    if (!operation) {
      console.error(`Operation ${config?.operationInfo?.type ?? ''} not supported`);
      return of(undefined);
    }

    const _performStrategy = this._injector.get(config.operationInfo?.performStrategy ?? BulkOperationPerformStrategy);
    return _performStrategy.invoke(config);
  }
}
