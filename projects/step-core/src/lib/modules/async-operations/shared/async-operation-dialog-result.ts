import { AsyncOperationCloseStatus } from './async-operation-close-status.enum';
import { AsyncTaskStatus } from '../../../client/augmented/shared/async-task-status';

export interface AsyncOperationDialogResult {
  closeStatus: AsyncOperationCloseStatus;
  operationStatus?: AsyncTaskStatus;
  error?: Error | AsyncTaskStatus;
}
