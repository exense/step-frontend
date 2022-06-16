/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $RepositoryObjectReference = {
    properties: {
        repositoryID: {
            type: 'string',
        },
        repositoryParameters: {
            type: 'dictionary',
            contains: {
                type: 'string',
            },
        },
    },
} as const;
