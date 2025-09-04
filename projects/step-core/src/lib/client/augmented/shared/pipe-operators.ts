import {
  buffer,
  filter,
  finalize,
  map,
  mergeMap,
  Observable,
  OperatorFunction,
  partition,
  pipe,
  scan,
  shareReplay,
  Subject,
  takeUntil,
  timer,
  UnaryFunction,
} from 'rxjs';
import { HttpEvent, HttpEventType, HttpProgressEvent, HttpResponse } from '@angular/common/http';

const EVENT_TYPES = [HttpEventType.UploadProgress, HttpEventType.Response];
const calculateProgressPercentage = (httpProgressEvent: HttpProgressEvent) => {
  return httpProgressEvent.total ? Math.round((100 * httpProgressEvent.loaded) / httpProgressEvent.total) : 0;
};

const decoder = new TextDecoder('UTF-8');
const decodeArrayBuffer = (arrayBuffer: ArrayBuffer) => decoder.decode(arrayBuffer);

export const bulkRequest = <T>(
  request: (ids: string[]) => Observable<T[]>,
  params?: {
    startDue?: number;
    intervalDuration?: number;
    getItemId?: (item: T) => string;
  },
): OperatorFunction<string | undefined, Map<string, T>> => {
  const defaultParams = {
    startDue: 500,
    intervalDuration: 1500,
    getItemId: (item: T) => (item as unknown as { id: string }).id,
  };
  const startDue = params?.startDue ?? defaultParams.startDue;
  const intervalDuration = params?.intervalDuration ?? defaultParams.intervalDuration;
  const getItemId = params?.getItemId ?? defaultParams.getItemId;

  return pipe(
    buffer(timer(startDue, intervalDuration)),
    map((ids) => ids.filter((id) => !!id) as string[]),
    map((ids) => Array.from(new Set(ids))),
    filter((ids) => !!ids.length),
    mergeMap((ids) => request(ids)),
    scan((result, items) => {
      items.forEach((item) => result.set(getItemId(item), item));
      return result;
    }, new Map<string, T>()),
    shareReplay(1),
  );
};

export const uploadWithProgress: UnaryFunction<
  Observable<HttpEvent<ArrayBuffer>>,
  {
    response$: Observable<string>;
    progress$: Observable<number>;
  }
> = (source$: Observable<HttpEvent<ArrayBuffer>>) => {
  const terminator$ = new Subject<void>();

  const stream$ = source$.pipe(
    filter((httpEvent) => EVENT_TYPES.includes(httpEvent.type)),
    shareReplay(1),
    takeUntil(terminator$),
  );

  const [uploadProgress$, uploadResponse$] = partition(
    stream$,
    (httpEvent) => httpEvent.type === HttpEventType.UploadProgress,
  );

  const progress$ = uploadProgress$.pipe(map((event) => calculateProgressPercentage(event as HttpProgressEvent)));

  const response$ = uploadResponse$.pipe(
    map((event) => event as HttpResponse<ArrayBuffer>),
    map((response) => (!!response.body ? decodeArrayBuffer(response.body) : '')),
    finalize(() => {
      terminator$.next();
      terminator$.complete();
    }),
  );

  return { progress$, response$ };
};
