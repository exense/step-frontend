import { ExecutiontTaskParameters } from '../client/generated';
import { Observable } from 'rxjs';

export abstract class SchedulerActionsService {
  abstract navToPlan(planId: string): void;
  abstract editParameter(scheduledTask: ExecutiontTaskParameters): Observable<boolean>;
  abstract resolveEditLinkIfExists(): void;
}
