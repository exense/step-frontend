/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TableFilter } from './TableFilter';
import type { TableParameters } from './TableParameters';

export type TableBulkOperationRequest = {
  filters?: Array<TableFilter>;
  tableParameters?: TableParameters;
  preview?: boolean;
  targetType?: 'ALL' | 'LIST' | 'FILTER';
  ids?: Array<string>;
};
