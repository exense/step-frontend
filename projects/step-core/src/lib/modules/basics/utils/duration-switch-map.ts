import { catchError, Observable, pipe, switchMap, tap, UnaryFunction } from 'rxjs';

export const durationSwitchMap = <Q, R>(
  doRequest: (request: Q) => Observable<R>,
  requestComplete?: (duration: number) => void,
): UnaryFunction<Observable<Q>, Observable<R>> => {
  return pipe(
    switchMap((request) => {
      const start = new Date().getTime();

      const complete = () => {
        const end = new Date().getTime();
        const duration = end - start;
        requestComplete?.(duration);
      };

      return doRequest(request).pipe(
        tap(() => complete()),
        catchError((err) => {
          complete();
          throw err;
        }),
      );
    }),
  );
};
