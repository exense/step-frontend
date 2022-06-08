/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CypressCommandExecution } from './CypressCommandExecution';

export type ExecutionReport = {
    commandExecutions?: Array<CypressCommandExecution>;
    sequence?: number;
    error?: string;
    attachments?: Array<Array<string>>;
};

