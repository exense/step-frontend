/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Measure = {
  name?: string;
  duration?: number;
  begin?: number;
  status?: 'PASSED' | 'FAILED' | 'TECHNICAL_ERROR';
  data?: Record<string, any>;
};
