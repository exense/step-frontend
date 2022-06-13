/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $FunctionPackage = {
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
        packageLibrariesLocation: {
            type: 'string',
        },
        packageLocation: {
            type: 'string',
        },
        watchForChange: {
            type: 'boolean',
        },
        packageAttributes: {
            type: 'dictionary',
            contains: {
                type: 'string',
            },
        },
        executeLocally: {
            type: 'boolean',
        },
        tokenSelectionCriteria: {
            type: 'dictionary',
            contains: {
                type: 'string',
            },
        },
        functions: {
            type: 'array',
            contains: {
                type: 'string',
                pattern: '[a-f0-9]{24}}',
            },
        },
        id: {
            type: 'string',
            pattern: '[a-f0-9]{24}}',
        },
    },
} as const;
