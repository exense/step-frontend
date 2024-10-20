/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $Parameter = {
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
    lastModificationDate: {
      type: 'string',
      format: 'date-time',
    },
    lastModificationUser: {
      type: 'string',
    },
    key: {
      type: 'string',
    },
    value: {
      type: 'DynamicValueString',
    },
    description: {
      type: 'string',
    },
    activationExpression: {
      type: 'Expression',
    },
    priority: {
      type: 'number',
      format: 'int32',
    },
    protectedValue: {
      type: 'boolean',
    },
    encryptedValue: {
      type: 'string',
    },
    scope: {
      type: 'Enum',
    },
    scopeEntity: {
      type: 'string',
    },
    id: {
      type: 'string',
      pattern: '[a-f0-9]{24}}',
    },
  },
} as const;
