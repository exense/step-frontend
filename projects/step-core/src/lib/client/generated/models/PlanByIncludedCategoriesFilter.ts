/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PlanFilter } from './PlanFilter';

export type PlanByIncludedCategoriesFilter = PlanFilter & {
  includedCategories?: Array<string>;
  includeCategories?: Array<string>;
};
