/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Filter } from './Filter';

export type Gte = Filter & {
  field?: string;
  value?: number;
};
