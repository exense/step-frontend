/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Resource = {
    customFields?: Record<string, any>;
    attributes?: Record<string, string>;
    currentRevisionId?: string;
    resourceType?: string;
    resourceName?: string;
    directory?: boolean;
    ephemeral?: boolean;
    id?: string;
};

