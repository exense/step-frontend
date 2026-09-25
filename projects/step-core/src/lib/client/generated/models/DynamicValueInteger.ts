/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { EvaluationResult } from './EvaluationResult';

export type DynamicValueInteger = {
  dynamic?: boolean;
  value?: number;
  expression?: string;
  expressionType?: string;
  interpolationResult?: EvaluationResult;
};
