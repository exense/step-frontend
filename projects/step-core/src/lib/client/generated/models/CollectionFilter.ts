/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Filter } from './Filter';
import type { TableFilter } from './TableFilter';

export type CollectionFilter = TableFilter & {
  collectionFilter?: Filter;
};
