/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $MetricAggregation = {
  properties: {
    type: {
      type: 'Enum',
      isRequired: true,
    },
    params: {
      type: 'dictionary',
      contains: {
        properties: {},
      },
    },
  },
} as const;
