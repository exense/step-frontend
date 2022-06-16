/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Filter } from './Filter';
import type { SearchOrder } from './SearchOrder';

export type FindRequest = {
    filter?: Filter;
    order?: SearchOrder;
    skip?: number;
    limit?: number;
    maxTime?: number;
};

