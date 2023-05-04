/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $BucketResponse = {
  properties: {
    begin: {
      type: 'number',
      isRequired: true,
      format: 'int64',
    },
    attributes: {
      type: 'dictionary',
      contains: {
        properties: {},
      },
      isRequired: true,
    },
    count: {
      type: 'number',
      isRequired: true,
      format: 'int64',
    },
    sum: {
      type: 'number',
      isRequired: true,
      format: 'int64',
    },
    min: {
      type: 'number',
      isRequired: true,
      format: 'int64',
    },
    max: {
      type: 'number',
      isRequired: true,
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
      isRequired: true,
      format: 'int64',
    },
  },
} as const;
