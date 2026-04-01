/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $In = {
  type: 'all-of',
  contains: [
    {
      type: 'Filter',
    },
    {
      properties: {
        values: {
          type: 'array',
          contains: {
            properties: {},
          },
        },
      },
    },
  ],
} as const;
