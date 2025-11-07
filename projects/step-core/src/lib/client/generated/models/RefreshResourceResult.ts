/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type RefreshResourceResult = {
  resultStatus?: 'REFRESHED' | 'NOT_REQUIRED' | 'FAILED';
  errorMessages?: Array<string>;
  infoMessages?: Array<string>;
  failed?: boolean;
};
