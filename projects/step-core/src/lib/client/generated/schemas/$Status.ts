/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $Status = {
  properties: {
    idleTimeMs: {
      type: 'number',
      format: 'int64',
    },
    activeTests: {
      type: 'number',
      format: 'int64',
    },
    lastExecutionEndTime: {
      type: 'number',
      format: 'int64',
    },
    lastUserActivityTime: {
      type: 'number',
      format: 'int64',
    },
  },
} as const;
