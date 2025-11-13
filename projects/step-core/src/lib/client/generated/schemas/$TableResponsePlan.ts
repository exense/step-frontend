/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $TableResponsePlan = {
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
        type: 'Plan',
      },
    },
    hasNext: {
      type: 'boolean',
    },
  },
} as const;
