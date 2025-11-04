/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Expression } from './Expression';

export type AutomationPackage = {
  customFields?: Record<string, any>;
  attributes?: Record<string, string>;
  creationDate?: string;
  creationUser?: string;
  lastModificationDate?: string;
  lastModificationUser?: string;
  status?: 'DELAYED_UPDATE' | 'ÄSCHEDULED_RELOAD' | 'RELOAD_FAILED';
  versionName?: string;
  activationExpression?: Expression;
  automationPackageResource?: string;
  automationPackageLibraryResource?: string;
  functionsAttributes?: Record<string, string>;
  plansAttributes?: Record<string, string>;
  tokenSelectionCriteria?: Record<string, string>;
  executeFunctionsLocally?: boolean;
  id?: string;
};
