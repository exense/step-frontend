/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DynamicValueInteger } from './DynamicValueInteger';
import type { Expression } from './Expression';
import type { JsonValue } from './JsonValue';

export type Function = {
  customFields?: Record<string, any>;
  attributes?: Record<string, string>;
  callTimeout?: DynamicValueInteger;
  schema?: Record<string, JsonValue>;
  executeLocally?: boolean;
  tokenSelectionCriteria?: Record<string, string>;
  managed?: boolean;
  activationExpression?: Expression;
  useCustomTemplate?: boolean;
  htmlTemplate?: string;
  description?: string;
  automationPackageFile?: string;
  id?: string;
  type: string;
};
