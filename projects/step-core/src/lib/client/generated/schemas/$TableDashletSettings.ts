/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $TableDashletSettings = {
  properties: {
    columns: {
      type: 'array',
      contains: {
        type: 'ColumnSelection',
      },
      isRequired: true,
    },
    aggregation: {
      type: 'MetricAggregation',
    },
  },
} as const;
