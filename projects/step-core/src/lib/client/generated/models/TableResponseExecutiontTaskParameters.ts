/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ExecutiontTaskParameters } from './ExecutiontTaskParameters';

export type TableResponseExecutiontTaskParameters = {
  recordsTotal?: number;
  recordsFiltered?: number;
  data?: Array<ExecutiontTaskParameters>;
  hasNext?: boolean;
};
