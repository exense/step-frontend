import { combineLatest, map, Observable, ObservableInputTuple, tap } from 'rxjs';

export const combineLatestWithTrackChanges = <A extends readonly unknown[]>(
  sources: [...ObservableInputTuple<A>],
): Observable<{ result: A; isChanged: boolean[] }> => {
  const n = sources.length;
  const indexes = new Array<number>(n).fill(0);
  const latest = new Array<number>(n).fill(0);

  const sourcesWithIndexUpdate = (sources as Observable<unknown>[]).map((src$, i) => {
    return src$.pipe(tap(() => indexes[i]++));
  }) as unknown as [...ObservableInputTuple<A>];

  return combineLatest(sourcesWithIndexUpdate).pipe(
    map((result: A) => {
      const isChanged = result.map((item, i) => indexes[i] !== latest[i]);
      for (let i = 0; i < n; i++) {
        latest[i] = indexes[i];
      }
      return { result, isChanged };
    }),
  );
};
