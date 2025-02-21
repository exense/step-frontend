/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $PlanByIncludedCategoriesFilter = {
  type: 'all-of',
  contains: [
    {
      type: 'PlanFilter',
    },
    {
      properties: {
        includedCategories: {
          type: 'array',
          contains: {
            type: 'string',
          },
        },
        includeCategories: {
          type: 'array',
          contains: {
            type: 'string',
          },
        },
      },
    },
  ],
} as const;
