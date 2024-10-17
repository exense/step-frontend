/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AgentPoolProvisioningConfiguration } from './AgentPoolProvisioningConfiguration';
import type { AgentProvisioningConfiguration } from './AgentProvisioningConfiguration';

export type ManualAgentProvisioningConfiguration = AgentProvisioningConfiguration & {
  configuredAgentPools?: Array<AgentPoolProvisioningConfiguration>;
};
