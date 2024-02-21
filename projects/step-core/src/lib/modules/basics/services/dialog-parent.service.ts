export abstract class DialogParentService {
  abstract dialogSuccessfullyClosed(): void;
  abstract dialogNotSuccessfullyClosed?(): void;
  abstract readonly returnParentUrl?: string;
}
