/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ArtefactFilter } from './ArtefactFilter';
import type { PlanFilter } from './PlanFilter';

export type AutomationPackageExecutionParameters = {
  customFields?: Record<string, any>;
  attributes?: Record<string, string>;
  customParameters?: Record<string, string>;
  userID?: string;
  artefactFilter?: ArtefactFilter;
  mode?: 'RUN' | 'SIMULATION';
  planFilter?: PlanFilter;
  wrapIntoTestSet?: boolean;
  numberOfThreads?: number;
  id?: string;
};
