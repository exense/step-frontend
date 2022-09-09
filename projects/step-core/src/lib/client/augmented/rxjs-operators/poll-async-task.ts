import { AsyncTasksService } from '../../generated';
import { Observable, of, tap, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AsyncTaskStatus } from '../shared/async-task-status';

export const pollAsyncTask = (
  asyncService: AsyncTasksService,
  progressHandler?: (value: number) => void,
  pollCount: number = 4
): ((src: Observable<AsyncTaskStatus>) => Observable<AsyncTaskStatus>) => {
  return (src) =>
    src.pipe(
      tap((status) => {
        if (progressHandler) {
          progressHandler(status?.progress || 0);
        }
      }),
      switchMap((status) => {
        if (!status || status.ready || pollCount === 0 || !status.id) {
          return of(status);
        }

        const id = status.id;
        return timer(500).pipe(
          switchMap((_) => asyncService.getAsyncTaskStatus(id)),
          pollAsyncTask(asyncService, progressHandler, pollCount - 1)
        );
      })
    );
};
