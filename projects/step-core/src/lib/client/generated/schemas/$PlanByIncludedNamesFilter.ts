/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $PlanByIncludedNamesFilter = {
  type: 'all-of',
  contains: [
    {
      type: 'PlanFilter',
    },
    {
      properties: {
        includedNames: {
          type: 'array',
          contains: {
            type: 'string',
          },
        },
      },
    },
  ],
} as const;
