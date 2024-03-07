import { Plan } from '../../../client/step-client-module';

export interface PlanEditorContext {
  currentPlanId?: string;
  plan?: Plan;
  compositeId?: string;
}
