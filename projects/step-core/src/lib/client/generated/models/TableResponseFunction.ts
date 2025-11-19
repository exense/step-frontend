/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Function } from './Function';

export type TableResponseFunction = {
  recordsTotal?: number;
  recordsFiltered?: number;
  data?: Array<Function>;
  hasNext?: boolean;
};
