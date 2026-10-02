/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { EvaluationResult } from './EvaluationResult';

export type DynamicValueBoolean = {
  dynamic?: boolean;
  value?: boolean;
  expression?: string;
  expressionType?: string;
  interpolationResult?: EvaluationResult;
};
