/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Execution } from './Execution';
import type { ResolvedExecutionNotice } from './ResolvedExecutionNotice';

export type ExecutionOverview = {
  execution?: Execution;
  resolvedNotices?: Array<ResolvedExecutionNotice>;
};
