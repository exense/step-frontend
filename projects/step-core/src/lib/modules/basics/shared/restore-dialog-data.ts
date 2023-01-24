import { Observable } from 'rxjs';
import { History } from '../../../client/generated';

export interface RestoreDialogData {
  version: string;
  history: Observable<History[]>;
}
