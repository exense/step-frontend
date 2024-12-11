/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $Gte = {
  type: 'all-of',
  contains: [
    {
      type: 'Filter',
    },
    {
      properties: {
        value: {
          type: 'number',
          format: 'int64',
        },
      },
    },
  ],
} as const;
