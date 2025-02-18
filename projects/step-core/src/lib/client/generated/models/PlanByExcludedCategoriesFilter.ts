/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PlanFilter } from './PlanFilter';

export type PlanByExcludedCategoriesFilter = PlanFilter & {
  excludedCategories?: Array<string>;
  excludeCategories?: Array<string>;
};
