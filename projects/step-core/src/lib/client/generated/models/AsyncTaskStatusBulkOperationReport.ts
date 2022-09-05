/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BulkOperationReport } from './BulkOperationReport';

export type AsyncTaskStatusBulkOperationReport = {
  id?: string;
  ready?: boolean;
  progress?: number;
  warnings?: Array<string>;
  error?: string;
  result?: BulkOperationReport;
};
