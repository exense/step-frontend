/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type TableBulkOperationReport = {
  count?: number;
  skipped?: number;
  failed?: number;
  warnings?: Array<string>;
  errors?: Array<string>;
};
