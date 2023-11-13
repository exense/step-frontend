/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CronExclusion } from './CronExclusion';
import type { ExecutionParameters } from './ExecutionParameters';

export type ExecutiontTaskParameters = {
  customFields?: Record<string, any>;
  attributes?: Record<string, string>;
  name?: string;
  executionsParameters?: ExecutionParameters;
  assertionPlan?: string;
  cronExpression?: string;
  cronExclusions?: Array<CronExclusion>;
  active?: boolean;
  id?: string;
};
