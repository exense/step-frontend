/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $Function = {
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
    callTimeout: {
      type: 'DynamicValueInteger',
    },
    schema: {
      type: 'dictionary',
      contains: {
        type: 'JsonValue',
      },
    },
    executeLocally: {
      type: 'boolean',
    },
    tokenSelectionCriteria: {
      type: 'dictionary',
      contains: {
        type: 'string',
      },
    },
    managed: {
      type: 'boolean',
    },
    activationExpression: {
      type: 'Expression',
    },
    useCustomTemplate: {
      type: 'boolean',
    },
    htmlTemplate: {
      type: 'string',
    },
    description: {
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
