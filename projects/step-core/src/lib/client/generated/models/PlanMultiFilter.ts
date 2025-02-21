/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PlanFilter } from './PlanFilter';

export type PlanMultiFilter = PlanFilter & {
  planFilters?: Array<PlanFilter>;
};
