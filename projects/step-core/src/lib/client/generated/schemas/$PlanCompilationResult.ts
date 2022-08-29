/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $PlanCompilationResult = {
  properties: {
    hasError: {
      type: 'boolean',
    },
    errors: {
      type: 'array',
      contains: {
        type: 'PlanCompilationError',
      },
    },
    plan: {
      type: 'Plan',
    },
  },
} as const;
