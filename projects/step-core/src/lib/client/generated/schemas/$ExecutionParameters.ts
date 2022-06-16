/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $ExecutionParameters = {
    properties: {
        customFields: {
            type: 'dictionary',
            contains: {
                properties: {
                },
            },
        },
        attributes: {
            type: 'dictionary',
            contains: {
                type: 'string',
            },
        },
        mode: {
            type: 'Enum',
        },
        plan: {
            type: 'Plan',
        },
        repositoryObject: {
            type: 'RepositoryObjectReference',
        },
        customParameters: {
            type: 'dictionary',
            contains: {
                type: 'string',
            },
        },
        description: {
            type: 'string',
        },
        userID: {
            type: 'string',
        },
        artefactFilter: {
            type: 'ArtefactFilter',
        },
        isolatedExecution: {
            type: 'boolean',
        },
        exports: {
            type: 'array',
            contains: {
                type: 'RepositoryObjectReference',
            },
        },
        id: {
            type: 'string',
            pattern: '[a-f0-9]{24}}',
        },
    },
} as const;
