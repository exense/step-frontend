/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $AggregationRequest = {
    properties: {
        timeWindow1: {
            type: 'LongTimeInterval',
        },
        selectors1: {
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
        timeWindow: {
            type: 'LongTimeInterval',
        },
    },
} as const;
