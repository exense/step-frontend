/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type ApplicationConfiguration = {
  authentication?: boolean;
  authenticatorName?: string;
  demo?: boolean;
  debug?: boolean;
  noLoginMask?: boolean;
  passwordManagement?: boolean;
  userManagement?: boolean;
  roleManagement?: boolean;
  projectMembershipManagement?: boolean;
  roles?: Array<string>;
  miscParams?: Record<string, string>;
  defaultUrl?: string;
  title?: string;
  contextRoot?: string;
  forceLegacyReporting?: boolean;
};
