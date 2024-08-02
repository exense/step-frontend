/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $ColumnSelection = {
  properties: {
    column: {
      type: 'Enum',
      isRequired: true,
    },
    aggregation: {
      type: 'MetricAggregation',
      isRequired: true,
    },
    selected: {
      type: 'boolean',
    },
  },
} as const;
