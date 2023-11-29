/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type ChartFilterItem = {
  attribute?: string;
  type?: 'OPTIONS' | 'FREE_TEXT' | 'EXECUTION' | 'TASK' | 'PLAN' | 'NUMERIC' | 'DATE';
  min?: number;
  max?: number;
  textValues?: Array<string>;
  exactMatch?: boolean;
};
