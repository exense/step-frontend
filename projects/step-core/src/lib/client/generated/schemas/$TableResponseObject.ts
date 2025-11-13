/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $TableResponseObject = {
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
        properties: {},
      },
    },
    hasNext: {
      type: 'boolean',
    },
  },
} as const;
