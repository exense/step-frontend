/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $RemoteExecutionRequest = {
  properties: {
    connection: {
      type: 'StepConnectionInfo',
    },
    library: {
      type: 'string',
    },
    includePlans: {
      type: 'array',
      contains: {
        type: 'string',
      },
    },
    excludePlans: {
      type: 'array',
      contains: {
        type: 'string',
      },
    },
    includeCategories: {
      type: 'array',
      contains: {
        type: 'string',
      },
    },
    excludeCategories: {
      type: 'array',
      contains: {
        type: 'string',
      },
    },
    wrapIntoTestSet: {
      type: 'boolean',
    },
    numberOfThreads: {
      type: 'number',
      format: 'int32',
    },
    executionParameters: {
      type: 'dictionary',
      contains: {
        type: 'string',
      },
    },
  },
} as const;
