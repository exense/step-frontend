/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Bucket = {
  customFields?: Record<string, any>;
  begin?: number;
  end?: number;
  attributes?: Record<string, any>;
  count?: number;
  sum?: number;
  min?: number;
  max?: number;
  pclPrecision?: number;
  distribution?: Record<string, number>;
  id?: string;
};
