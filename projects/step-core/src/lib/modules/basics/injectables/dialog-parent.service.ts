import { DialogRouteResult } from '../types/dialog-route-result';
import { ActivatedRoute } from '@angular/router';

export abstract class DialogParentService {
  abstract dialogSuccessfullyClosed?(): void;
  abstract dialogNotSuccessfullyClosed?(): void;
  abstract navigateBack?(result?: DialogRouteResult, relativeTo?: ActivatedRoute): void;
  abstract readonly returnParentUrl?: string;
}
