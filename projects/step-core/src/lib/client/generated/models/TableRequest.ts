/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Sort } from './Sort';
import type { TableFilter } from './TableFilter';
import type { TableParameters } from './TableParameters';

export type TableRequest = {
  filters?: Array<TableFilter>;
  tableParameters?: TableParameters;
  skip?: number;
  limit?: number;
  sort?: Array<Sort>;
  performEnrichment?: boolean;
  calculateCounts?: boolean;
};
