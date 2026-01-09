/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $TableResponseUserBookmark = {
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
        type: 'UserBookmark',
      },
    },
    hasNext: {
      type: 'boolean',
    },
  },
} as const;
