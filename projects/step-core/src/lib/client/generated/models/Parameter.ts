/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Expression } from './Expression';
import type { DynamicValueString } from './DynamicValueString';

export type Parameter = {
  customFields?: Record<string, any>;
  attributes?: Record<string, string>;
  lastModificationDate?: string;
  lastModificationUser?: string;
  key?: string;
  value?: DynamicValueString;
  description?: string;
  activationExpression?: Expression;
  priority?: number;
  protectedValue?: boolean;
  encryptedValue?: string;
  scope?: 'GLOBAL' | 'APPLICATION' | 'FUNCTION';
  scopeEntity?: string;
  id?: string;
};
