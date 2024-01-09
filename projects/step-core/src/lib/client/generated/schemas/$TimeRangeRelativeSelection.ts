/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $TimeRangeRelativeSelection = {
  properties: {
    label: {
      type: 'string',
    },
    timeInMs: {
      type: 'number',
      isRequired: true,
      format: 'int64',
    },
  },
} as const;
