/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Operation } from './Operation';

export type OperationDetails = {
  execId?: string;
  planId?: string;
  planName?: string;
  testcase?: string;
  operation?: Operation;
};
