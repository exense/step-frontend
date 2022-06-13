/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $TestSetStatusOverview = {
    properties: {
        testsetName: {
            type: 'string',
        },
        runs: {
            type: 'array',
            contains: {
                type: 'TestRunStatus',
            },
        },
    },
} as const;
