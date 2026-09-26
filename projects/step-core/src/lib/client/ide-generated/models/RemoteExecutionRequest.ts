/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { StepConnectionInfo } from './StepConnectionInfo';

export type RemoteExecutionRequest = {
  connection?: StepConnectionInfo;
  library?: string;
  includePlans?: Array<string>;
  excludePlans?: Array<string>;
  includeCategories?: Array<string>;
  excludeCategories?: Array<string>;
  wrapIntoTestSet?: boolean;
  numberOfThreads?: number;
  executionParameters?: Record<string, string>;
};
