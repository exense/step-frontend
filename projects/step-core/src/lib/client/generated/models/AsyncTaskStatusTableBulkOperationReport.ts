/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TableBulkOperationReport } from './TableBulkOperationReport';

export type AsyncTaskStatusTableBulkOperationReport = {
  id?: string;
  ready?: boolean;
  progress?: number;
  warnings?: Array<string>;
  error?: string;
  result?: TableBulkOperationReport;
};
