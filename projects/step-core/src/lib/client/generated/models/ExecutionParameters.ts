/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ArtefactFilter } from './ArtefactFilter';
import type { Plan } from './Plan';
import type { RepositoryObjectReference } from './RepositoryObjectReference';

export type ExecutionParameters = {
    customFields?: Record<string, any>;
    attributes?: Record<string, string>;
    mode?: 'RUN' | 'SIMULATION';
    plan?: Plan;
    repositoryObject?: RepositoryObjectReference;
    customParameters?: Record<string, string>;
    description?: string;
    userID?: string;
    artefactFilter?: ArtefactFilter;
    isolatedExecution?: boolean;
    exports?: Array<RepositoryObjectReference>;
    id?: string;
};

