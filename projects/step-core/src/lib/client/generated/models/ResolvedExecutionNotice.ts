/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type ResolvedExecutionNotice = {
  typeId?: string;
  category?: string;
  severity?: 'INFO' | 'WARNING' | 'ERROR';
  message?: string;
  timestamp?: number;
};
