/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $TimeRange = {
  properties: {
    from: {
      type: 'number',
      isRequired: true,
      format: 'int64',
    },
    to: {
      type: 'number',
      isRequired: true,
      format: 'int64',
    },
  },
} as const;
