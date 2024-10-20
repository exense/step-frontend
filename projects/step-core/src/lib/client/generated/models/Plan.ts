/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AbstractArtefact } from './AbstractArtefact';
import type { AgentProvisioningConfiguration } from './AgentProvisioningConfiguration';
import type { Function } from './Function';

export type Plan = {
  customFields?: Record<string, any>;
  attributes?: Record<string, string>;
  root?: AbstractArtefact;
  functions?: Array<Function>;
  subPlans?: Array<Plan>;
  agents?: AgentProvisioningConfiguration;
  visible?: boolean;
  categories?: Array<string>;
  id?: string;
  _class: string;
};
