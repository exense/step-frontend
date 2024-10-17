/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AgentProvisioningConfiguration } from './AgentProvisioningConfiguration';

export type AutomaticAgentProvisioningConfiguration = AgentProvisioningConfiguration & {
  mode?: 'auto_detect';
};
