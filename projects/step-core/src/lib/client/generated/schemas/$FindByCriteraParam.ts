/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $FindByCriteraParam = {
  properties: {
    criteria: {
      type: 'dictionary',
      contains: {
        type: 'string',
      },
    },
    start: {
      type: 'string',
      format: 'date-time',
    },
    end: {
      type: 'string',
      format: 'date-time',
    },
    limit: {
      type: 'number',
      format: 'int32',
    },
    skip: {
      type: 'number',
      format: 'int32',
    },
  },
} as const;
