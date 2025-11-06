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
    creationDate: {
      type: 'string',
      format: 'date-time',
    },
    creationUser: {
      type: 'string',
    },
    lastModificationDate: {
      type: 'string',
      format: 'date-time',
    },
    lastModificationUser: {
      type: 'string',
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
    origin: {
      type: 'string',
    },
    originTimestamp: {
      type: 'number',
      format: 'int64',
    },
    id: {
      type: 'string',
      pattern: '[a-f0-9]{24}}',
    },
  },
} as const;
