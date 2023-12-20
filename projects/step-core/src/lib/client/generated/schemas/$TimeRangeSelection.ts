/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $TimeRangeSelection = {
  properties: {
    type: {
      type: 'Enum',
      isRequired: true,
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
