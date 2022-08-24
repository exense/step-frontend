/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TestRunStatus } from './TestRunStatus';

export type TestSetStatusOverview = {
  testsetName?: string;
  runs?: Array<TestRunStatus>;
};
