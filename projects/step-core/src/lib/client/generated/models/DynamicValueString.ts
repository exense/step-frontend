/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { EvaluationResult } from './EvaluationResult';

export type DynamicValueString = {
  dynamic?: boolean;
  value?: string;
  expression?: string;
  expressionType?: string;
  interpolationResult?: EvaluationResult;
};
