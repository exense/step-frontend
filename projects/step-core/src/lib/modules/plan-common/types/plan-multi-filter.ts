import { PlanFilter } from '../../../client/step-client-module';
import { PlanFilterType } from './plan-filter-type.enum';

export class PlanMultiFilter implements PlanFilter {
  constructor(readonly planFilters: PlanFilter[]) {}
  readonly class = PlanFilterType.MULTI_FILTER;
}
