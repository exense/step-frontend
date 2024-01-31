/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ArtefactFilter } from './ArtefactFilter';
import type { Plan } from './Plan';
import type { RepositoryObjectReference } from './RepositoryObjectReference';

export type ExecutionParameters = {
  customFields?: Record<string, any>;
  attributes?: Record<string, string>;
  customParameters?: Record<string, string>;
  userID?: string;
  artefactFilter?: ArtefactFilter;
  mode?: 'RUN' | 'SIMULATION';
  plan?: Plan;
  repositoryObject?: RepositoryObjectReference;
  isolatedExecution?: boolean;
  exports?: Array<RepositoryObjectReference>;
  description?: string;
  id?: string;
};
