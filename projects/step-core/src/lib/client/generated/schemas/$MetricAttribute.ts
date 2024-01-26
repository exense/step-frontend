/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $MetricAttribute = {
  properties: {
    name: {
      type: 'string',
      isRequired: true,
    },
    displayName: {
      type: 'string',
      isRequired: true,
    },
    type: {
      type: 'Enum',
      isRequired: true,
    },
    metadata: {
      type: 'dictionary',
      contains: {
        properties: {},
      },
      isRequired: true,
    },
  },
} as const;
