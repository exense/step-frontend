/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $Regex = {
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
        expression: {
          type: 'string',
        },
        caseSensitive: {
          type: 'boolean',
        },
      },
    },
  ],
} as const;
