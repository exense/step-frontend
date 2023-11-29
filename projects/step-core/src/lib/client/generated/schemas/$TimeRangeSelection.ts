/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $TimeRangeSelection = {
  properties: {
    type: {
      type: 'Enum',
    },
    absoluteSelection: {
      type: 'TimeRange',
    },
    relativeRangeMs: {
      type: 'number',
      format: 'int64',
    },
  },
} as const;
