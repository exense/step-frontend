import { PlanFilter } from '../../../client/step-client-module';
import { PlanFilterType } from './plan-filter-type.enum';

export class PlanByExcludedNamesFilter implements PlanFilter {
  constructor(public readonly excludedNames: string[]) {}
  readonly class = PlanFilterType.EXCLUDED_NAMES;
}
