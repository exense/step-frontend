/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ProjectMembership } from './ProjectMembership';

export type Project = {
    customFields?: Record<string, any>;
    attributes?: Record<string, string>;
    global?: boolean;
    members?: Array<ProjectMembership>;
    id?: string;
};

