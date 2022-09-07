/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $Equals = {
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
        expectedValue: {
          properties: {},
        },
      },
    },
  ],
} as const;
