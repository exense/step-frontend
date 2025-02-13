import { PlanFilter } from '../../../client/step-client-module';
import { PlanFilterType } from './plan-filter-type.enum';

export class PlanByExcludeCategoriesFilter implements PlanFilter {
  constructor(public readonly excludedCategories: string[]) {}
  readonly class = PlanFilterType.EXCLUDED_CATEGORIES;
}
