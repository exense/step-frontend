import { Observable } from 'rxjs';

export abstract class PlanInteractiveSessionService {
  abstract isInteractiveSessionActive$: Observable<boolean>;
  abstract execute(nodeId?: string): void;
}
