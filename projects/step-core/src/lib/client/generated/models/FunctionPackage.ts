/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type FunctionPackage = {
  customFields?: Record<string, any>;
  attributes?: Record<string, string>;
  packageLibrariesLocation?: string;
  packageLocation?: string;
  watchForChange?: boolean;
  packageAttributes?: Record<string, string>;
  executeLocally?: boolean;
  tokenSelectionCriteria?: Record<string, string>;
  functions?: Array<string>;
  id?: string;
};
