import { Observable } from 'rxjs';
import { AsyncTaskStatus } from '../../../client/augmented/shared/async-task-status';

export interface AsyncOperationDialogOptions {
  title: string;
  confirmMessage: string;
  successMessage: string;
  errorMessage: string;
  onSuccess?(result?: AsyncTaskStatus): void;
  onError?(error: Error): void;
  asyncOperation(): Observable<AsyncTaskStatus>;
}
