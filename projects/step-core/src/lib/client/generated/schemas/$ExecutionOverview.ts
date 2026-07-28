/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $ExecutionOverview = {
  properties: {
    execution: {
      type: 'Execution',
    },
    resolvedNotices: {
      type: 'array',
      contains: {
        type: 'ResolvedExecutionNotice',
      },
    },
  },
} as const;
