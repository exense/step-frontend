/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $FlatAggregatedReport = {
  properties: {
    aggregatedReportViews: {
      type: 'array',
      contains: {
        type: 'AggregatedReportView',
      },
    },
  },
} as const;
