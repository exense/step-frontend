/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $AutomationPackageExecutionParameters = {
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
    customParameters: {
      type: 'dictionary',
      contains: {
        type: 'string',
      },
    },
    userID: {
      type: 'string',
    },
    artefactFilter: {
      type: 'ArtefactFilter',
    },
    mode: {
      type: 'Enum',
    },
    planFilter: {
      type: 'PlanFilter',
    },
    wrapIntoTestSet: {
      type: 'boolean',
    },
    numberOfThreads: {
      type: 'number',
      format: 'int32',
    },
    id: {
      type: 'string',
      pattern: '[a-f0-9]{24}}',
    },
  },
} as const;
