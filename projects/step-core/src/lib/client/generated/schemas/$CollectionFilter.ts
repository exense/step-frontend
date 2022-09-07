/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $CollectionFilter = {
  type: 'all-of',
  contains: [
    {
      type: 'TableFilter',
    },
    {
      properties: {
        collectionFilter: {
          type: 'Filter',
        },
      },
    },
  ],
} as const;
