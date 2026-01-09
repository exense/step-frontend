/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Plan } from './Plan';

export type TableResponsePlan = {
  recordsTotal?: number;
  recordsFiltered?: number;
  data?: Array<Plan>;
  hasNext?: boolean;
};
