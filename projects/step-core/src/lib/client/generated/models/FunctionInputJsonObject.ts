/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { JsonValue } from './JsonValue';

export type FunctionInputJsonObject = {
    payload?: Record<string, JsonValue>;
    properties?: Record<string, string>;
};

