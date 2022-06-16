/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Interest } from './Interest';
import type { TokenWrapperOwner } from './TokenWrapperOwner';

export type SelectTokenArgument = {
    attributes?: Record<string, string>;
    interests?: Record<string, Interest>;
    matchTimeout?: number;
    noMatchTimeout?: number;
    tokenOwner?: TokenWrapperOwner;
};

