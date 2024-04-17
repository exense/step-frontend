import { PlanContext } from '../types/plan-context.interface';

export abstract class PlanContextInitializerService {
  abstract initializeContext(planContext?: PlanContext, preselectArtefact?: boolean): void;
}
