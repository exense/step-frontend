/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $PackagePreview = {
  properties: {
    loadingError: {
      type: 'string',
    },
    functions: {
      type: 'array',
      contains: {
        type: 'Function',
      },
    },
  },
} as const;
