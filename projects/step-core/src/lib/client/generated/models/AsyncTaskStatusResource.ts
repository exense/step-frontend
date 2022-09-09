/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Resource } from './Resource';

export type AsyncTaskStatusResource = {
  id?: string;
  ready?: boolean;
  progress?: number;
  warnings?: Array<string>;
  error?: string;
  result?: Resource;
};
