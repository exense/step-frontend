import { ExecutiontTaskParameters } from '../client/generated';
import { Observable } from 'rxjs';

export abstract class SchedulerActionsService {
  abstract editTask(scheduledTask: ExecutiontTaskParameters): Observable<boolean>;
  abstract navigateToTaskEditor(scheduledTask: ExecutiontTaskParameters): void;
  abstract resolveEditLinkIfExists(): void;
}
