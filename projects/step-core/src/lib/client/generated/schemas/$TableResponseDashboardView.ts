/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $TableResponseDashboardView = {
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
        type: 'DashboardView',
      },
    },
    hasNext: {
      type: 'boolean',
    },
  },
} as const;
