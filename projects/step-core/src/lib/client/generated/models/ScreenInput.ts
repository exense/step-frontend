/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Input } from './Input';

export type ScreenInput = {
    customFields?: Record<string, any>;
    attributes?: Record<string, string>;
    screenId?: string;
    position?: number;
    input?: Input;
    id?: string;
};

