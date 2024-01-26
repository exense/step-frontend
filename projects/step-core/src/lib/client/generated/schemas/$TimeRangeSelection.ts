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
    relativeSelection: {
      type: 'TimeRangeRelativeSelection',
    },
  },
} as const;
