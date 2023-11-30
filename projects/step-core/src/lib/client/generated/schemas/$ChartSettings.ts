/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $ChartSettings = {
  properties: {
    metricKey: {
      type: 'string',
    },
    attributes: {
      type: 'array',
      contains: {
        type: 'MetricAttribute',
      },
    },
    primaryAxes: {
      type: 'AxesSettings',
    },
    filters: {
      type: 'array',
      contains: {
        type: 'ChartFilterItem',
      },
    },
    grouping: {
      type: 'array',
      contains: {
        type: 'string',
      },
    },
    inheritGlobalFilters: {
      type: 'boolean',
    },
    inheritGlobalGrouping: {
      type: 'boolean',
    },
    readonlyGrouping: {
      type: 'boolean',
    },
    readonlyAggregate: {
      type: 'boolean',
    },
  },
} as const;
