/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Expression } from './Expression';

export type AutomationPackage = {
  customFields?: Record<string, any>;
  attributes?: Record<string, string>;
  status?: 'DELAYED_UPDATE';
  version?: string;
  activationExpression?: Expression;
  id?: string;
};
