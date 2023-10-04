/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $MetricRenderingSettings = {
  properties: {
    unit: {
      type: 'Enum',
    },
    defaultAggregation: {
      type: 'Enum',
    },
    seriesColors: {
      type: 'dictionary',
      contains: {
        type: 'string',
      },
    },
    defaultGroupingAttributes: {
      type: 'array',
      contains: {
        type: 'string',
      },
    },
  },
} as const;
