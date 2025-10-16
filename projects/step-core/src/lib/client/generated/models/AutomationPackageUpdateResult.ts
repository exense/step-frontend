/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ConflictingAutomationPackages } from './ConflictingAutomationPackages';

export type AutomationPackageUpdateResult = {
  status?: 'CREATED' | 'UPDATED' | 'UPDATE_DELAYED';
  id?: string;
  conflictingAutomationPackages?: ConflictingAutomationPackages;
};
