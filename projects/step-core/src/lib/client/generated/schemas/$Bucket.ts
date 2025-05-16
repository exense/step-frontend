/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $Bucket = {
  properties: {
    customFields: {
      type: 'dictionary',
      contains: {
        properties: {},
      },
    },
    begin: {
      type: 'number',
      format: 'int64',
    },
    end: {
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
    pclPrecision: {
      type: 'number',
      format: 'int64',
    },
    distribution: {
      type: 'dictionary',
      contains: {
        type: 'number',
        format: 'int64',
      },
    },
    id: {
      type: 'string',
      pattern: '[a-f0-9]{24}}',
    },
  },
} as const;
