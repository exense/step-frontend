import { Observable } from 'rxjs';

export abstract class ArtefactRefreshNotificationService {
  abstract readonly refreshArtefact$: Observable<unknown>;
}
