/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type TimeSeriesFilterItem = {
  label?: string;
  attribute: string;
  type: 'OPTIONS' | 'FREE_TEXT' | 'EXECUTION' | 'TASK' | 'PLAN' | 'NUMERIC' | 'DATE';
  exactMatch: boolean;
  min?: number;
  max?: number;
  textValues?: Array<string>;
  textOptions?: Array<string>;
  removable?: boolean;
};
