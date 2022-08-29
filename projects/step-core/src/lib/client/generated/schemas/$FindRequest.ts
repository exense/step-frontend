/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $FindRequest = {
  properties: {
    filter: {
      type: 'Filter',
    },
    order: {
      type: 'SearchOrder',
    },
    skip: {
      type: 'number',
      format: 'int32',
    },
    limit: {
      type: 'number',
      format: 'int32',
    },
    maxTime: {
      type: 'number',
      format: 'int32',
    },
  },
} as const;
