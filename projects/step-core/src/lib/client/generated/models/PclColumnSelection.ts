/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ColumnSelection } from './ColumnSelection';

export type PclColumnSelection = ColumnSelection & {
  pclValue?: number;
} & {
  pclValue: number;
};
