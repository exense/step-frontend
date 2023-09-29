/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $MetricType = {
  properties: {
    customFields: {
      type: 'dictionary',
      contains: {
        properties: {},
      },
    },
    name: {
      type: 'string',
    },
    label: {
      type: 'string',
    },
    unit: {
      type: 'string',
    },
    attributes: {
      type: 'array',
      contains: {
        type: 'MetricAttribute',
      },
    },
    groupingAttribute: {
      type: 'string',
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
    id: {
      type: 'string',
      pattern: '[a-f0-9]{24}}',
    },
  },
} as const;
