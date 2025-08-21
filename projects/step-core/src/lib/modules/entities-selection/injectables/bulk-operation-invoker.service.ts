import { EnvironmentInjector, inject, Injectable, Injector } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { BulkOperationPerformStrategy } from '../types/bulk-operation-perform.strategy';
import { BulkOperationConfig } from '../types/bulk-operation-config.interface';
import { AsyncOperationDialogResult } from '../../async-operations/shared/async-operation-dialog-result';

@Injectable({
  providedIn: 'root',
})
export class BulkOperationInvokerService {
  private _rootInjector = inject(Injector);

  invokeOperation<KEY>(
    config: BulkOperationConfig<KEY>,
    parentInjector?: Injector,
  ): Observable<AsyncOperationDialogResult | undefined> {
    parentInjector = parentInjector ?? this._rootInjector;

    const operation = config.operationInfo?.operation;

    if (!operation) {
      console.error(`Operation ${config?.operationInfo?.type ?? ''} not supported`);
      return of(undefined);
    }

    let _performStrategy: BulkOperationPerformStrategy<KEY>;

    let injector: EnvironmentInjector | undefined;
    if (config.operationInfo?.performStrategy) {
      injector = Injector.create({
        providers: [
          {
            provide: config.operationInfo.performStrategy,
            useClass: config.operationInfo.performStrategy,
          },
        ],
        parent: parentInjector,
      }) as EnvironmentInjector;
      _performStrategy = injector.get<BulkOperationPerformStrategy<KEY>>(config.operationInfo.performStrategy);
    } else {
      _performStrategy = parentInjector.get(BulkOperationPerformStrategy);
    }

    return _performStrategy.invoke(config).pipe(
      tap(() => {
        if (injector) {
          injector.destroy();
        }
      }),
    );
  }
}
