/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Filter } from './Filter';
import type { SearchOrder } from './SearchOrder';

export type DirectMongoQuery = {
    host?: string;
    user?: string;
    port?: number;
    database?: string;
    collection?: string;
    query?: Filter;
    projection?: string;
    skip?: number;
    limit?: number;
    sort?: SearchOrder;
};

