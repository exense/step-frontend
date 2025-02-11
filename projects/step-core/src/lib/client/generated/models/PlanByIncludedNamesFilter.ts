/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PlanFilter } from './PlanFilter';

export type PlanByIncludedNamesFilter = PlanFilter & {
  includedNames?: Array<string>;
};
