/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TableFilter } from './TableFilter';

export type BulkOperationParameters = {
  preview?: boolean;
  targetType?: 'ALL' | 'LIST' | 'FILTER';
  ids?: Array<string>;
  filters?: Array<TableFilter>;
};
