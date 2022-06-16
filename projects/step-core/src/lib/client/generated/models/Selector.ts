/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { NumericalFilter } from './NumericalFilter';
import type { TextFilter } from './TextFilter';

export type Selector = {
    textFilters?: Array<TextFilter>;
    numericalFilters?: Array<NumericalFilter>;
};

