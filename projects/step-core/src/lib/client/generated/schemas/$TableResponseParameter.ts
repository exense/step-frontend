/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $TableResponseParameter = {
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
        type: 'Parameter',
      },
    },
    hasNext: {
      type: 'boolean',
    },
  },
} as const;
