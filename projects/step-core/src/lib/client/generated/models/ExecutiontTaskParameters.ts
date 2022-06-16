/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ExecutionParameters } from './ExecutionParameters';

export type ExecutiontTaskParameters = {
    customFields?: Record<string, any>;
    attributes?: Record<string, string>;
    name?: string;
    executionsParameters?: ExecutionParameters;
    cronExpression?: string;
    active?: boolean;
    id?: string;
};

