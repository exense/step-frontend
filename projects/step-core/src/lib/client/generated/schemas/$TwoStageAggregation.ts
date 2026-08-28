/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $TwoStageAggregation = {
  properties: {
    timeAggregation: {
      type: 'Enum',
      isRequired: true,
    },
    groupAggregation: {
      type: 'Enum',
      isRequired: true,
    },
  },
} as const;
