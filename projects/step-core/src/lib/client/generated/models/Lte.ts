/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Filter } from './Filter';

export type Lte = Filter & {
  field?: string;
  value?: number;
};
