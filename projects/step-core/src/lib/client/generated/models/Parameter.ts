/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DynamicValueString } from './DynamicValueString';
import type { Expression } from './Expression';

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
