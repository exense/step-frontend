export abstract class DialogParentService {
  abstract dialogSuccessfullyClosed(): void;
  abstract readonly returnParentUrl?: string;
}
