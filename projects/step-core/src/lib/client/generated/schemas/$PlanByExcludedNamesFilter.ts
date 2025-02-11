/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $PlanByExcludedNamesFilter = {
  type: 'all-of',
  contains: [
    {
      type: 'PlanFilter',
    },
    {
      properties: {
        excludedNames: {
          type: 'array',
          contains: {
            type: 'string',
          },
        },
      },
    },
  ],
} as const;
