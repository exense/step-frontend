/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $Fulltext = {
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
      },
    },
  ],
} as const;
