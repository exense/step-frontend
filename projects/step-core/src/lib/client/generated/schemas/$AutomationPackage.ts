/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $AutomationPackage = {
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
    status: {
      type: 'Enum',
    },
    version: {
      type: 'string',
    },
    activationExpression: {
      type: 'Expression',
    },
    id: {
      type: 'string',
      pattern: '[a-f0-9]{24}}',
    },
  },
} as const;
