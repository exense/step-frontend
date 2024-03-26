import { DialogRouteResult } from '../types/dialog-route-result';

export abstract class DialogParentService {
  abstract dialogSuccessfullyClosed?(): void;
  abstract dialogNotSuccessfullyClosed?(): void;
  abstract navigateBack?(result?: DialogRouteResult): void;
  abstract readonly returnParentUrl?: string;
}
