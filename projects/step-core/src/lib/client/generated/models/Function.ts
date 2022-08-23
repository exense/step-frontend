/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DynamicValueInteger } from './DynamicValueInteger';
import type { JsonValue } from './JsonValue';

export type Function = {
  customFields?: Record<string, any>;
  attributes?: Record<string, string>;
  callTimeout?: DynamicValueInteger;
  schema?: Record<string, JsonValue>;
  executeLocally?: boolean;
  tokenSelectionCriteria?: Record<string, string>;
  managed?: boolean;
  useCustomTemplate?: boolean;
  htmlTemplate?: string;
  description?: string;
  id?: string;
  type: string;
};
