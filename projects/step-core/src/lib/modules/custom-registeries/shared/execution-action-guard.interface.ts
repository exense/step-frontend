import { Observable } from 'rxjs';
import { Execution } from '../../../client/generated';
import { CustomRegistryItem } from './custom-registry-item';

export interface ExecutionActionGuard extends CustomRegistryItem {
  actionType: string;
  operation: (execution?: Execution) => Observable<boolean>;
  order?: number;
}
