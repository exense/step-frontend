/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TableFilter } from './TableFilter';

export type FieldFilter = (TableFilter & {
    field?: string;
    value?: string;
    regex?: boolean;
});

