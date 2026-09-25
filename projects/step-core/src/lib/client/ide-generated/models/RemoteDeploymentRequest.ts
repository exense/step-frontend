/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { StepConnectionInfo } from './StepConnectionInfo';

export type RemoteDeploymentRequest = {
  connection?: StepConnectionInfo;
  library?: string;
  async?: boolean;
  versionName?: string;
  activationExpression?: string;
  forceRefreshOfSnapshots?: boolean;
  deploymentTimeout?: number;
  plansAttributes?: Record<string, string>;
  keywordsAttributes?: Record<string, string>;
  tokenSelectionCriteria?: Record<string, string>;
  executeKeywordsOnController?: boolean;
};
