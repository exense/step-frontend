import { Observable } from 'rxjs';
import { AsyncTaskStatus } from '../../../client/augmented/shared/async-task-status';

export interface AsyncOperationDialogOptions {
  title: string;
  showCloseButtonOnSuccess?: boolean;
  successMessage(result?: AsyncTaskStatus): string;
  errorMessage(errorOrResult: Error | AsyncTaskStatus): string;
  asyncOperation(): Observable<AsyncTaskStatus>;
}
