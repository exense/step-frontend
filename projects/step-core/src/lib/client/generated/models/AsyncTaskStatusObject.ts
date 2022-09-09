/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type AsyncTaskStatusObject = {
  id?: string;
  ready?: boolean;
  progress?: number;
  warnings?: Array<string>;
  error?: string;
  result?: any;
};
