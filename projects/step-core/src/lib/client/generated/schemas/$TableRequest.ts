/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $TableRequest = {
    properties: {
        filters: {
            type: 'array',
            contains: {
                type: 'TableFilter',
            },
        },
        skip: {
            type: 'number',
            format: 'int32',
        },
        limit: {
            type: 'number',
            format: 'int32',
        },
        sort: {
            type: 'Sort',
        },
        tableParameters: {
            type: 'TableParameters',
        },
    },
} as const;
