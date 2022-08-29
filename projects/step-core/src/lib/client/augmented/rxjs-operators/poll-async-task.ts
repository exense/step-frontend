import {
  AsyncTasksService,
  AsyncTaskStatusObject,
  AsyncTaskStatusResource,
  AsyncTaskStatusVoid,
} from '../../generated';
import { Observable, of, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

type AsyncTaskStatus = AsyncTaskStatusVoid | AsyncTaskStatusObject | AsyncTaskStatusResource;

export const pollAsyncTask = (
  asyncService: AsyncTasksService,
  pollCount: number = 4
): ((src: Observable<AsyncTaskStatus>) => Observable<AsyncTaskStatus>) => {
  return (src) =>
    src.pipe(
      switchMap((status) => {
        if (!status || status.ready || pollCount === 0 || !status.id) {
          return of(status);
        }

        const id = status.id;
        return timer(500).pipe(
          switchMap((_) => asyncService.getAsyncTaskStatus(id)),
          pollAsyncTask(asyncService, pollCount - 1)
        );
      })
    );
};
