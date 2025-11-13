/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Parameter } from './Parameter';

export type TableResponseParameter = {
  recordsTotal?: number;
  recordsFiltered?: number;
  data?: Array<Parameter>;
  hasNext?: boolean;
};
