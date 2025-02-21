/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $PlanByExcludedCategoriesFilter = {
  type: 'all-of',
  contains: [
    {
      type: 'PlanFilter',
    },
    {
      properties: {
        excludedCategories: {
          type: 'array',
          contains: {
            type: 'string',
          },
        },
        excludeCategories: {
          type: 'array',
          contains: {
            type: 'string',
          },
        },
      },
    },
  ],
} as const;
