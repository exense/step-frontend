/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LongTimeInterval } from './LongTimeInterval';
import type { Selector } from './Selector';

export type AggregationRequest = {
    timeWindow1?: LongTimeInterval;
    selectors1?: Array<Selector>;
    serviceParams?: Record<string, string>;
    timeWindow?: LongTimeInterval;
};

