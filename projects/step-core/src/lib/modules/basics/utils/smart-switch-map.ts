import { map, Observable, of, pipe, shareReplay, Subject, switchMap, takeUntil, tap, UnaryFunction } from 'rxjs';
import { DestroyRef } from '@angular/core';
import { durationSwitchMap } from './duration-switch-map';

export const smartSwitchMap = <Q, R>(
  isForce: (currentRequest: Q, previousRequest?: Q) => boolean,
  doRequest: (request: Q) => Observable<R>,
  destroyRef: DestroyRef,
  requestComplete?: (duration: number) => void,
  logKey?: string,
): UnaryFunction<Observable<Q>, Observable<R>> => {
  let requestRef$: Observable<R> | undefined = undefined;
  let currentRequestTerminator$: Subject<void> | undefined = undefined;
  let previousRequest: Q | undefined = undefined;

  const debugLog = (...params: unknown[]) => {
    if (logKey) {
      console.log(logKey, ...params);
    }
  };

  const terminateCurrentRequest = () => {
    if (requestRef$) {
      debugLog('TERMINATE PREVIOUS REQUEST');
    }
    currentRequestTerminator$?.next?.();
    currentRequestTerminator$?.complete?.();
    currentRequestTerminator$ = undefined;
    previousRequest = undefined;
    requestRef$ = undefined;
  };

  destroyRef.onDestroy(() => terminateCurrentRequest());

  return pipe(
    map((request) => {
      const force = isForce(request, previousRequest);
      debugLog('IS FORCE', force);
      if (requestRef$ && !force) {
        previousRequest = request;
        debugLog('USE ONGOING REQUEST');
        return requestRef$;
      }

      terminateCurrentRequest();
      previousRequest = request;
      currentRequestTerminator$ = new Subject<void>();
      debugLog('START NEW REQUEST');
      requestRef$ = of(request).pipe(
        durationSwitchMap(doRequest, requestComplete),
        tap(() => (requestRef$ = undefined)),
        takeUntil(currentRequestTerminator$),
        shareReplay(1),
      );

      return requestRef$;
    }),
    switchMap((request$) => {
      return request$.pipe(
        tap(() => {
          debugLog('REQUEST FINISHED');
        }),
      );
    }),
  );
};
