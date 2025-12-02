/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CallFunction } from './CallFunction';

export type LookupCallFunctionRequest = {
  callFunction?: CallFunction;
  bindings?: Record<string, any>;
};
