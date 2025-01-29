import { PlanFilter } from '../../../client/step-client-module';
import { PlanFilterType } from './plan-filter-type.enum';

export class PlanByIncludedCategoriesFilter implements PlanFilter {
  constructor(public readonly includeCategories: string[]) {}
  readonly class = PlanFilterType.INCLUDED_CATEGORIES;
}
