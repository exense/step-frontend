/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Filter } from './Filter';

export type Regex = Filter & {
  field?: string;
  expression?: string;
  caseSensitive?: boolean;
};
