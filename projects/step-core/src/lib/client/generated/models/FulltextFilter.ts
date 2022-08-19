/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TableFilter } from './TableFilter';

export type FulltextFilter = (TableFilter & {
    text?: string;
});

