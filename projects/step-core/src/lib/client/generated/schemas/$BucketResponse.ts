/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $BucketResponse = {
  properties: {
    begin: {
      type: 'number',
      format: 'int64',
    },
    attributes: {
      type: 'dictionary',
      contains: {
        properties: {},
      },
    },
    count: {
      type: 'number',
      format: 'int64',
    },
    sum: {
      type: 'number',
      format: 'int64',
    },
    min: {
      type: 'number',
      format: 'int64',
    },
    max: {
      type: 'number',
      format: 'int64',
    },
    pclValues: {
      type: 'dictionary',
      contains: {
        type: 'number',
        format: 'int64',
      },
    },
    throughputPerHour: {
      type: 'number',
      format: 'int64',
    },
  },
} as const;
