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
