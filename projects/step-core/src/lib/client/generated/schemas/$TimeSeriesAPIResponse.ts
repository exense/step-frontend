/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $TimeSeriesAPIResponse = {
  properties: {
    start: {
      type: 'number',
      isRequired: true,
      format: 'int64',
    },
    interval: {
      type: 'number',
      isRequired: true,
      format: 'int64',
    },
    end: {
      type: 'number',
      isRequired: true,
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
      isRequired: true,
    },
    matrixKeys: {
      type: 'array',
      contains: {
        type: 'BucketAttributes',
      },
      isRequired: true,
    },
  },
} as const;
