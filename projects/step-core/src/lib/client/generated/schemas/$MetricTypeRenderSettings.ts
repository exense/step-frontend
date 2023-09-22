/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $MetricTypeRenderSettings = {
  properties: {
    groupingAttribute: {
      type: 'string',
    },
    groupingOptions: {
      type: 'array',
      contains: {
        type: 'string',
      },
    },
    seriesColors: {
      type: 'dictionary',
      contains: {
        type: 'string',
      },
    },
    getyAxesUnit: {
      type: 'string',
    },
  },
} as const;
