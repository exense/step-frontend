import { EntityActionInterceptor } from '../modules/entity/injectables/entity-action.interceptor';
import { Plan } from '../client/step-client-module';

export abstract class BasePlanAction extends EntityActionInterceptor<Plan> {
  readonly entityType = 'plans';
}
