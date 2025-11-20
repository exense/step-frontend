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
    status: {
      type: 'Enum',
    },
    versionName: {
      type: 'string',
    },
    activationExpression: {
      type: 'Expression',
    },
    automationPackageResource: {
      type: 'string',
    },
    automationPackageLibraryResource: {
      type: 'string',
    },
    automationPackageResourceRevision: {
      type: 'string',
    },
    automationPackageLibraryResourceRevision: {
      type: 'string',
    },
    functionsAttributes: {
      type: 'dictionary',
      contains: {
        type: 'string',
      },
    },
    plansAttributes: {
      type: 'dictionary',
      contains: {
        type: 'string',
      },
    },
    tokenSelectionCriteria: {
      type: 'dictionary',
      contains: {
        type: 'string',
      },
    },
    executeFunctionsLocally: {
      type: 'boolean',
    },
    id: {
      type: 'string',
      pattern: '[a-f0-9]{24}}',
    },
  },
} as const;
