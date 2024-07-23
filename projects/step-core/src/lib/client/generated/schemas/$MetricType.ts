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
      isRequired: true,
    },
    displayName: {
      type: 'string',
      isRequired: true,
    },
    description: {
      type: 'string',
    },
    attributes: {
      type: 'array',
      contains: {
        type: 'MetricAttribute',
      },
      isRequired: true,
    },
    unit: {
      type: 'string',
    },
    defaultAggregation: {
      type: 'MetricAggregation',
      isRequired: true,
    },
    defaultGroupingAttributes: {
      type: 'array',
      contains: {
        type: 'string',
      },
      isRequired: true,
    },
    renderingSettings: {
      type: 'MetricRenderingSettings',
      isRequired: true,
    },
    id: {
      type: 'string',
      pattern: '[a-f0-9]{24}}',
    },
  },
} as const;
