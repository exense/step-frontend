/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $ParameterizedHeader = {
  properties: {
    value: {
      type: 'string',
    },
    parameters: {
      type: 'dictionary',
      contains: {
        type: 'string',
      },
    },
  },
} as const;
