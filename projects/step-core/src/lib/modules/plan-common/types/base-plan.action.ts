import { EntityActionInterceptor } from '../../entity/entity.module';
import { Plan } from '../../../client/step-client-module';

export abstract class BasePlanAction extends EntityActionInterceptor<Plan> {
  readonly entityType = 'plans';
}
