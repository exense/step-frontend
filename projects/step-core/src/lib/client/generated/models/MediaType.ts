/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type MediaType = {
  type?: string;
  subtype?: string;
  parameters?: Record<string, string>;
  wildcardSubtype?: boolean;
  wildcardType?: boolean;
};
