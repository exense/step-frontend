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
    name: {
      type: 'string',
    },
    resolution: {
      type: 'number',
      format: 'int64',
    },
    timeRange: {
      type: 'TimeRangeSelection',
    },
    grouping: {
      type: 'array',
      contains: {
        type: 'string',
      },
    },
    filters: {
      type: 'array',
      contains: {
        type: 'ChartFilterItem',
      },
    },
    dashlets: {
      type: 'array',
      contains: {
        type: 'DashboardItem',
      },
    },
    id: {
      type: 'string',
      pattern: '[a-f0-9]{24}}',
    },
  },
} as const;
