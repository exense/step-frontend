/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AgentProvisioningLog } from '../models/AgentProvisioningLog';
import type { TokenProvisioningError } from '../models/TokenProvisioningError';

export type TokenProvisioningStatus = {
  statusDescription?: string;
  completed?: boolean;
  error?: TokenProvisioningError;
  provisioningLogs?: Record<string, AgentProvisioningLog>;
};
