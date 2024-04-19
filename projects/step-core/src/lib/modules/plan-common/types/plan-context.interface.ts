import { Plan } from '../../../client/step-client-module';

export interface PlanContext {
  id: string;
  plan: Plan;
  entity: {
    id?: string;
    attributes?: Record<string, string>;
    customFields?: Record<string, any>;
  };
  entityType: string;
}
