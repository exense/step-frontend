/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Filter } from './Filter';

export type Gt = Filter & {
  field?: string;
  value?: number;
};
