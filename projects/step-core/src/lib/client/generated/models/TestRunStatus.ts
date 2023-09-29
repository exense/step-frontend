/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type TestRunStatus = {
  id?: string;
  testplanName?: string;
  status?:
    | 'VETOED'
    | 'IMPORT_ERROR'
    | 'TECHNICAL_ERROR'
    | 'FAILED'
    | 'INTERRUPTED'
    | 'PASSED'
    | 'SKIPPED'
    | 'NORUN'
    | 'RUNNING';
};
