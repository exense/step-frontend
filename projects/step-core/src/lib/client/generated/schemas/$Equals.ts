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
        expectedValue: {
          properties: {},
        },
      },
    },
  ],
} as const;
