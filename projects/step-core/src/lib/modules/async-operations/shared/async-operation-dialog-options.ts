import { Observable } from 'rxjs';
import { AsyncTaskStatus } from '../../../client/augmented/shared/async-task-status';
import { SafeHtml } from '@angular/platform-browser';

export interface AsyncOperationDialogOptions {
  title: SafeHtml;
  showCloseButtonOnSuccess?: boolean;
  successMessage(result?: AsyncTaskStatus): SafeHtml;
  errorMessage(errorOrResult: Error | AsyncTaskStatus): SafeHtml;
  asyncOperation(): Observable<AsyncTaskStatus>;
}
