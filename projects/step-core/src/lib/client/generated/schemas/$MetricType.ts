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
    key: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
    description: {
      type: 'string',
    },
    attributes: {
      type: 'array',
      contains: {
        type: 'MetricAttribute',
      },
    },
    unit: {
      type: 'Enum',
    },
    defaultAggregation: {
      type: 'Enum',
    },
    defaultGroupingAttributes: {
      type: 'array',
      contains: {
        type: 'string',
      },
    },
    renderingSettings: {
      type: 'MetricRenderingSettings',
    },
    id: {
      type: 'string',
      pattern: '[a-f0-9]{24}}',
    },
  },
} as const;
