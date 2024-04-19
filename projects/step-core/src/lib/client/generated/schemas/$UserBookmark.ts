/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $UserBookmark = {
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
    userId: {
      type: 'string',
      isRequired: true,
    },
    url: {
      type: 'string',
      isRequired: true,
    },
    id: {
      type: 'string',
      pattern: '[a-f0-9]{24}}',
    },
  },
} as const;
