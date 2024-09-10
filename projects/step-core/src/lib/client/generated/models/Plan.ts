/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AbstractArtefact } from './AbstractArtefact';
import type { AutomaticAgentProvisioningConfiguration } from './AutomaticAgentProvisioningConfiguration';
import type { ManualAgentProvisioningConfiguration } from './ManualAgentProvisioningConfiguration';
import type { Function } from './Function';

export type Plan = {
  customFields?: Record<string, any>;
  attributes?: Record<string, string>;
  root?: AbstractArtefact;
  functions?: Array<Function>;
  subPlans?: Array<Plan>;
  agents?: AutomaticAgentProvisioningConfiguration | ManualAgentProvisioningConfiguration;
  visible?: boolean;
  id?: string;
  _class: string;
};
