/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $AttributeStats = {
  properties: {
    name: {
      type: 'string',
      isRequired: true,
    },
    usagePercentage: {
      type: 'number',
      isRequired: true,
      format: 'double',
    },
  },
} as const;
