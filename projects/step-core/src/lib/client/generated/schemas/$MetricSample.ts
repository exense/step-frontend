/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $MetricSample = {
  properties: {
    sampleTime: {
      type: 'number',
      format: 'int64',
    },
    name: {
      type: 'string',
    },
    labels: {
      type: 'dictionary',
      contains: {
        type: 'string',
      },
    },
    type: {
      type: 'Enum',
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
    last: {
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
  },
} as const;
