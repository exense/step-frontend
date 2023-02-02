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
    oqlFilter: {
      type: 'string',
    },
    params: {
      type: 'dictionary',
      contains: {
        type: 'string',
      },
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
    percentiles: {
      type: 'array',
      contains: {
        type: 'number',
        format: 'int32',
      },
    },
  },
} as const;
