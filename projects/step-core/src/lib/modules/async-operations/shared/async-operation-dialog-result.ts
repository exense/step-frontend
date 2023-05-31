import { AsyncOperationCloseStatus } from './async-operation-close-status.enum';
import { AsyncTaskStatus } from '../../../client/step-client-module';

export interface AsyncOperationDialogResult {
  closeStatus: AsyncOperationCloseStatus;
  operationStatus?: AsyncTaskStatus;
  error?: Error | AsyncTaskStatus;
}
