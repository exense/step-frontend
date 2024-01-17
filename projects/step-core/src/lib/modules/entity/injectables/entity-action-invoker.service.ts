import { inject, Injectable } from '@angular/core';
import { catchError, concatAll, from, Observable, of, pipe, reduce, tap } from 'rxjs';
import { EntityActionRegistryService } from './entity-action-registry.service';

class StopChain extends Error {
  constructor() {
    super('STOP_CHAIN');
  }
}

@Injectable({
  providedIn: 'root',
})
export class EntityActionInvokerService {
  private _entityActionRegistry = inject(EntityActionRegistryService);

  private handleStopChain = pipe(
    tap((result: boolean) => {
      if (!result) {
        throw new StopChain();
      }
    })
  );

  invokeAction<T, P = unknown>(
    entityType: string,
    action: string,
    entity: T,
    additionalParams?: P
  ): Observable<boolean> {
    let operations = this._entityActionRegistry
      .getInterceptors(entityType, action)
      .map((action) => action.invokeAction(entity, additionalParams).pipe(this.handleStopChain));

    if (operations.length === 0) {
      operations = [of(true)];
    }

    return from(operations).pipe(
      concatAll(),
      reduce((acc, current) => acc && current, true),
      catchError((error) => {
        if (error instanceof StopChain) {
          return of(false);
        }
        throw error;
      })
    );
  }
}
