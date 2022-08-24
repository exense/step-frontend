/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $TimeSeriesAPIResponse = {
  properties: {
    start: {
      type: 'number',
      format: 'int64',
    },
    interval: {
      type: 'number',
      format: 'int64',
    },
    end: {
      type: 'number',
      format: 'int64',
    },
    matrix: {
      type: 'array',
      contains: {
        type: 'array',
        contains: {
          type: 'BucketResponse',
        },
      },
    },
    matrixKeys: {
      type: 'array',
      contains: {
        type: 'BucketAttributes',
      },
    },
  },
} as const;
