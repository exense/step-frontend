/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CallPlan } from './CallPlan';

export type LookupCallPlanRequest = {
  callPlan?: CallPlan;
  bindings?: Record<string, any>;
};
