/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LongTimeInterval } from './LongTimeInterval';
import type { Selector } from './Selector';

export type ComparisonRequest = {
    timeWindow1?: LongTimeInterval;
    timeWindow2?: LongTimeInterval;
    selectors1?: Array<Selector>;
    selectors2?: Array<Selector>;
    serviceParams?: Record<string, string>;
};

