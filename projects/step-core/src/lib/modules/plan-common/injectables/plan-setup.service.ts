import { Plan } from '../../../client/step-client-module';

export abstract class PlanSetupService {
  abstract setupPlan(plan?: Plan, preselectArtefact?: boolean): void;
}
