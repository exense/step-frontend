import { Observable } from 'rxjs';
import { TableBulkOperationRequest, AsyncTaskStatus } from '../../../client/step-client-module';

export type BulkOperation = (requestBody?: TableBulkOperationRequest) => Observable<AsyncTaskStatus>;
