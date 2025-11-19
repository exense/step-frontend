/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $TableResponseFunction = {
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
        type: 'Function',
      },
    },
    hasNext: {
      type: 'boolean',
    },
  },
} as const;
