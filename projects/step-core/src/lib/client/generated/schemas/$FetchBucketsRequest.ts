/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $FetchBucketsRequest = {
    properties: {
        start: {
            type: 'number',
            format: 'int64',
        },
        end: {
            type: 'number',
            format: 'int64',
        },
        params: {
            type: 'dictionary',
            contains: {
                type: 'string',
            },
        },
        threadGroupBuckets: {
            type: 'boolean',
        },
        groupDimensions: {
            type: 'array',
            contains: {
                type: 'string',
            },
        },
        numberOfBuckets: {
            type: 'number',
            format: 'int64',
        },
        intervalSize: {
            type: 'number',
            format: 'int64',
        },
        pclPrecisions: {
            type: 'array',
            contains: {
                type: 'number',
                format: 'int32',
            },
        },
    },
} as const;
