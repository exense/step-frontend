/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $ComparisonRequest = {
    properties: {
        timeWindow1: {
            type: 'LongTimeInterval',
        },
        timeWindow2: {
            type: 'LongTimeInterval',
        },
        selectors1: {
            type: 'array',
            contains: {
                type: 'Selector',
            },
        },
        selectors2: {
            type: 'array',
            contains: {
                type: 'Selector',
            },
        },
        serviceParams: {
            type: 'dictionary',
            contains: {
                type: 'string',
            },
        },
    },
} as const;
