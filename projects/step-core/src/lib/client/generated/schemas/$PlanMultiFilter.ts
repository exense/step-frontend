/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $PlanMultiFilter = {
  type: 'all-of',
  contains: [
    {
      type: 'PlanFilter',
    },
    {
      properties: {
        planFilters: {
          type: 'array',
          contains: {
            type: 'PlanFilter',
          },
        },
      },
    },
  ],
} as const;
