/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TableFilter } from './TableFilter';

export type BulkOperationParameters = {
  simulate?: boolean;
  targetType?: 'ALL' | 'LIST' | 'FILTER';
  ids?: Array<string>;
  filter?: TableFilter;
};
