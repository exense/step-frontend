/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PlanFilter } from './PlanFilter';

export type PlanByExcludedNamesFilter = PlanFilter & {
  excludedNames?: Array<string>;
};
