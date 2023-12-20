/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $ChartSettings = {
  properties: {
    metricKey: {
      type: 'string',
      isRequired: true,
    },
    attributes: {
      type: 'array',
      contains: {
        type: 'MetricAttribute',
      },
      isRequired: true,
    },
    primaryAxes: {
      type: 'AxesSettings',
      isRequired: true,
    },
    filters: {
      type: 'array',
      contains: {
        type: 'ChartFilterItem',
      },
      isRequired: true,
    },
    grouping: {
      type: 'array',
      contains: {
        type: 'string',
      },
      isRequired: true,
    },
    inheritGlobalFilters: {
      type: 'boolean',
      isRequired: true,
    },
    inheritGlobalGrouping: {
      type: 'boolean',
      isRequired: true,
    },
    readonlyGrouping: {
      type: 'boolean',
      isRequired: true,
    },
    readonlyAggregate: {
      type: 'boolean',
      isRequired: true,
    },
  },
} as const;
