/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $AutomationPackageDescriptor = {
  properties: {
    directory: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
    warnings: {
      type: 'array',
      contains: {
        type: 'string',
      },
    },
  },
} as const;
