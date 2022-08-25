/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $ResourceUploadResponse = {
  properties: {
    resource: {
      type: 'Resource',
    },
    similarResources: {
      type: 'array',
      contains: {
        type: 'Resource',
      },
    },
  },
} as const;
