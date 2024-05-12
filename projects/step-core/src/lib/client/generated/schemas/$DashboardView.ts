/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $DashboardView = {
  properties: {
    customFields: {
      type: 'dictionary',
      contains: {
        properties: {},
      },
    },
    attributes: {
      type: 'dictionary',
      contains: {
        type: 'string',
      },
    },
    description: {
      type: 'string',
    },
    resolution: {
      type: 'number',
      format: 'int64',
    },
    refreshInterval: {
      type: 'number',
      format: 'int64',
    },
    timeRange: {
      type: 'TimeRangeSelection',
      isRequired: true,
    },
    grouping: {
      type: 'array',
      contains: {
        type: 'string',
      },
      isRequired: true,
    },
    filters: {
      type: 'array',
      contains: {
        type: 'TimeSeriesFilterItem',
      },
      isRequired: true,
    },
    dashlets: {
      type: 'array',
      contains: {
        type: 'DashboardItem',
      },
      isRequired: true,
    },
    metadata: {
      type: 'dictionary',
      contains: {
        properties: {},
      },
    },
    id: {
      type: 'string',
      pattern: '[a-f0-9]{24}}',
    },
  },
} as const;
