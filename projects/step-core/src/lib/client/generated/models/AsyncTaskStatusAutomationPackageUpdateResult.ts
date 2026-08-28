/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AutomationPackageUpdateResult } from './AutomationPackageUpdateResult';

export type AsyncTaskStatusAutomationPackageUpdateResult = {
  id?: string;
  ready?: boolean;
  progress?: number;
  warnings?: Array<string>;
  error?: string;
  result?: AutomationPackageUpdateResult;
};
