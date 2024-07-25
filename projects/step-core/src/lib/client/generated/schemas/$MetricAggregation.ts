/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $MetricAggregation = {
  properties: {
    type: {
      type: 'Enum',
    },
    params: {
      type: 'dictionary',
      contains: {
        properties: {},
      },
    },
  },
} as const;
