/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TableFilter } from './TableFilter';

export type OQLFilter = TableFilter & {
  oql?: string;
};
