/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $TableResponseReportLayout = {
  properties: {
    recordsTotal: {
      type: 'number',
      format: 'int64',
    },
    recordsFiltered: {
      type: 'number',
      format: 'int64',
    },
    data: {
      type: 'array',
      contains: {
        type: 'ReportLayout',
      },
    },
    hasNext: {
      type: 'boolean',
    },
  },
} as const;
