import { Plan } from '../../../client/step-client-module';
import { Observable } from 'rxjs';

export abstract class PlanLinkDialogService {
  abstract editPlan(plan: Plan, artefactId?: string): Observable<boolean>;
}
