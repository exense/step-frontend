import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot } from '@angular/router';
import { inject, Injector, runInInjectionContext } from '@angular/core';
import { concatMap, from, last, Observable, of, takeWhile } from 'rxjs';

export const sequenceCanActivateGuards = (guards: CanActivateFn[]): CanActivateFn => {
  const injector = inject(Injector);

  return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
    from(guards).pipe(
      concatMap((guard) => {
        const result = runInInjectionContext(injector, () => guard(route, state));
        if (result instanceof Observable) {
          return result;
        }
        if (result instanceof Promise) {
          return from(result);
        }
        return of(result);
      }),
      takeWhile((value) => value === true, true),
      last(),
    );
};
