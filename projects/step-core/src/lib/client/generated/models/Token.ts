/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Interest } from './Interest';

export type Token = {
    id?: string;
    agentid?: string;
    attributes?: Record<string, string>;
    selectionPatterns?: Record<string, Interest>;
};

