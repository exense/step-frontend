/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $Lte = {
  type: 'all-of',
  contains: [
    {
      type: 'Filter',
    },
    {
      properties: {
        field: {
          type: 'string',
        },
        value: {
          type: 'number',
          format: 'int64',
        },
      },
    },
  ],
} as const;
