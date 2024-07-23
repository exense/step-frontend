/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $DashboardItem = {
  properties: {
    id: {
      type: 'string',
      isRequired: true,
    },
    name: {
      type: 'string',
      isRequired: true,
    },
    type: {
      type: 'Enum',
      isRequired: true,
    },
    masterChartId: {
      type: 'string',
    },
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
    filters: {
      type: 'array',
      contains: {
        type: 'TimeSeriesFilterItem',
      },
      isRequired: true,
    },
    inheritSpecificFiltersOnly: {
      type: 'boolean',
      isRequired: true,
    },
    specificFiltersToInherit: {
      type: 'array',
      contains: {
        type: 'string',
      },
      isRequired: true,
    },
    oql: {
      type: 'string',
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
    chartSettings: {
      type: 'ChartSettings',
    },
    tableSettings: {
      type: 'TableDashletSettings',
    },
    size: {
      type: 'number',
      isRequired: true,
      format: 'int32',
    },
  },
} as const;
