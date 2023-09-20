import { Observable } from 'rxjs';
import { AsyncOperationDialogResult } from '../../async-operations/async-operations.module';
import { BulkOperationConfig } from './bulk-operation-config.interface';

export abstract class BulkOperationPerformStrategy<ID = string> {
  abstract invoke(config: BulkOperationConfig<ID>): Observable<AsyncOperationDialogResult | undefined>;
}
