import { AsyncTasksService } from '../../generated';
import { of, tap, timer, pipe, OperatorFunction } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AsyncTaskStatus } from '../shared/async-task-status';

export const pollAsyncTask = (
  asyncService: AsyncTasksService,
  progressHandler?: (value: number) => void
): OperatorFunction<AsyncTaskStatus, AsyncTaskStatus> =>
  pipe(
    tap((status) => {
      if (progressHandler) {
        progressHandler(status?.progress || 0);
      }
    }),
    switchMap((status) => {
      if (!status || status.ready || !status.id) {
        return of(status);
      }

      const id = status.id;
      return timer(500).pipe(
        switchMap(() => asyncService.getAsyncTaskStatus(id)),
        pollAsyncTask(asyncService, progressHandler)
      );
    })
  );
