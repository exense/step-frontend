/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $Message = {
  properties: {
    customFields: {
      type: 'dictionary',
      contains: {
        properties: {},
      },
    },
    importance: {
      type: 'Enum',
    },
    subject: {
      type: 'string',
    },
    body: {
      type: 'string',
    },
    category: {
      type: 'string',
    },
    subcategory: {
      type: 'string',
    },
    topicKey: {
      type: 'string',
    },
    sticky: {
      type: 'boolean',
    },
    timestamp: {
      type: 'number',
      format: 'int64',
    },
    userStates: {
      type: 'dictionary',
      contains: {
        type: 'Enum',
      },
    },
    id: {
      type: 'string',
      pattern: '[a-f0-9]{24}}',
    },
  },
} as const;
