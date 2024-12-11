/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Filter = {
  field?: string;
  children?: Array<Filter>;
  type: string;
};
