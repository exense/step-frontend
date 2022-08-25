/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $FulltextFilter = {
  type: 'all-of',
  contains: [
    {
      type: 'TableFilter',
    },
    {
      properties: {
        text: {
          type: 'string',
        },
      },
    },
  ],
} as const;
