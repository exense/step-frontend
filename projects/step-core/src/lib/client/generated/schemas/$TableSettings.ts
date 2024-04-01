/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $TableSettings = {
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
    filters: {
      type: 'array',
      contains: {
        type: 'TimeSeriesFilterItem',
      },
      isRequired: true,
    },
    oql: {
      type: 'string',
    },
    columns: {
      type: 'array',
      contains: {
        type: 'ColumnSelection',
      },
    },
  },
} as const;
