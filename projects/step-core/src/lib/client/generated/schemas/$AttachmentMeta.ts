/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $AttachmentMeta = {
  properties: {
    name: {
      type: 'string',
    },
    id: {
      type: 'string',
      pattern: '[a-f0-9]{24}}',
    },
    type: {
      type: 'string',
      isRequired: true,
    },
  },
} as const;
