/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Error } from './Error';
import type { ExecutionParameters } from './ExecutionParameters';
import type { ExecutiontTaskParameters } from './ExecutiontTaskParameters';
import type { ImportResult } from './ImportResult';
import type { ReportExport } from './ReportExport';

export type Execution = {
  agentsInvolved: string;
  customFields?: Record<string, any>;
  attributes?: Record<string, string>;
  startTime?: number;
  endTime?: number;
  description?: string;
  executionType?: string;
  status?:
    | 'INITIALIZING'
    | 'IMPORTING'
    | 'ESTIMATING'
    | 'PROVISIONING'
    | 'RUNNING'
    | 'ABORTING'
    | 'FORCING_ABORT'
    | 'DEPROVISIONING'
    | 'EXPORTING'
    | 'ENDED';
  result?:
    | 'VETOED'
    | 'IMPORT_ERROR'
    | 'TECHNICAL_ERROR'
    | 'FAILED'
    | 'INTERRUPTED'
    | 'PASSED'
    | 'SKIPPED'
    | 'NORUN'
    | 'RUNNING';
  lifecycleErrors?: Array<Error>;
  planId?: string;
  importResult?: ImportResult;
  reportExports?: Array<ReportExport>;
  executionTaskID?: string;
  parameters?: Record<string, string>;
  executionParameters?: ExecutionParameters;
  executiontTaskParameters?: ExecutiontTaskParameters;
  resolvedPlanRootNodeId?: string;
  id?: string;
};
