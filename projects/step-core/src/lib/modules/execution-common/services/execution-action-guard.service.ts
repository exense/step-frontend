import { inject, Injectable } from '@angular/core';
import { concatMap, defaultIfEmpty, defer, every, from, Observable, take } from 'rxjs';
import { Execution } from '../../../client/generated';
import { ExecutionActionGuardRegistryService } from '../../custom-registeries/services/execution-action-guard-registry.service';

@Injectable({
  providedIn: 'root',
})
export class ExecutionActionGuardService {
  private readonly _registry = inject(ExecutionActionGuardRegistryService);

  check(actionType: string, execution: Execution | undefined): Observable<boolean> {
    return defer(() =>
      from(this._registry.getGuards(actionType)).pipe(
        concatMap((guard) => defer(() => guard.operation(execution)).pipe(take(1), defaultIfEmpty(false))),
        every((allowed) => allowed),
      ),
    );
  }
}
