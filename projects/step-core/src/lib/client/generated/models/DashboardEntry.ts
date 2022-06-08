/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Execution } from './Execution';
import type { ExecutiontTaskParameters } from './ExecutiontTaskParameters';

export type DashboardEntry = {
    schedulerTask?: ExecutiontTaskParameters;
    lastExecution?: Execution;
    lastExecutionBeforeResultChange?: Execution;
    simplifiedStatus?: 'TECHNICAL_ERROR' | 'FAILED' | 'PASSED' | 'INTERRUPTED' | 'SKIPPED' | 'NORUN' | 'RUNNING';
    position?: number;
};

