import { PlanFilter } from '../../../client/step-client-module';
import { PlanFilterType } from './plan-filter-type.enum';

export class PlanByIncludedNamesFilter implements PlanFilter {
  constructor(public readonly includedNames: string[]) {}
  readonly class = PlanFilterType.INCLUDED_NAMES;
}
