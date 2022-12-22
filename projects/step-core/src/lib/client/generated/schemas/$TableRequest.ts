/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $TableRequest = {
  properties: {
    filters: {
      type: 'array',
      contains: {
        type: 'TableFilter',
      },
    },
    tableParameters: {
      type: 'TableParameters',
    },
    skip: {
      type: 'number',
      format: 'int32',
    },
    limit: {
      type: 'number',
      format: 'int32',
    },
    sort: {
      type: 'Sort',
    },
  },
} as const;
