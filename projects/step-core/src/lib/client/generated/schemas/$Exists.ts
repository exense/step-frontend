/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $Exists = {
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
      },
    },
  ],
} as const;
