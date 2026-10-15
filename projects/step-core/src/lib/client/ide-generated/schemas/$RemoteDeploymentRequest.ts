/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $RemoteDeploymentRequest = {
  properties: {
    connection: {
      type: 'StepConnectionInfo',
    },
    library: {
      type: 'string',
    },
    async: {
      type: 'boolean',
    },
    versionName: {
      type: 'string',
    },
    activationExpression: {
      type: 'string',
    },
    forceRefreshOfSnapshots: {
      type: 'boolean',
    },
    deploymentTimeout: {
      type: 'number',
      format: 'int32',
    },
    plansAttributes: {
      type: 'dictionary',
      contains: {
        type: 'string',
      },
    },
    keywordsAttributes: {
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
    executeKeywordsOnController: {
      type: 'boolean',
    },
  },
} as const;
