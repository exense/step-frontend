/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Sort } from './Sort';
import type { TableFilter } from './TableFilter';
import type { TableParameters } from './TableParameters';

export type TableRequest = {
    filters?: Array<TableFilter>;
    skip?: number;
    limit?: number;
    sort?: Sort;
    tableParameters?: TableParameters;
};

