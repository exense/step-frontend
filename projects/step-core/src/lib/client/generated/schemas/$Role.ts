/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $Role = {
  properties: {
    customFields: {
      type: 'dictionary',
      contains: {
        properties: {},
      },
    },
    attributes: {
      type: 'dictionary',
      contains: {
        type: 'string',
      },
    },
    rights: {
      type: 'array',
      contains: {
        type: 'string',
      },
    },
    id: {
      type: 'string',
      pattern: '[a-f0-9]{24}}',
    },
  },
} as const;
