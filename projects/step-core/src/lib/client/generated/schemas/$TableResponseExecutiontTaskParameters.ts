/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $TableResponseExecutiontTaskParameters = {
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
        type: 'ExecutiontTaskParameters',
      },
    },
    hasNext: {
      type: 'boolean',
    },
  },
} as const;
