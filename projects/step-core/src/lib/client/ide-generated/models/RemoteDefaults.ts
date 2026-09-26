/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { RemoteDeploymentRequest } from './RemoteDeploymentRequest';
import type { RemoteExecutionRequest } from './RemoteExecutionRequest';

export type RemoteDefaults = {
  deploy?: RemoteDeploymentRequest;
  execute?: RemoteExecutionRequest;
};
