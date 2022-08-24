/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type TaskStatus = {
  id?: string;
  ready?: boolean;
  progress?: number;
  warnings?: Array<string>;
  result?: any;
};
