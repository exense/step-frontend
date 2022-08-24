/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $Resource = {
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
    currentRevisionId: {
      type: 'string',
      pattern: '[a-f0-9]{24}}',
    },
    resourceType: {
      type: 'string',
    },
    resourceName: {
      type: 'string',
    },
    directory: {
      type: 'boolean',
    },
    ephemeral: {
      type: 'boolean',
    },
    id: {
      type: 'string',
      pattern: '[a-f0-9]{24}}',
    },
  },
} as const;
