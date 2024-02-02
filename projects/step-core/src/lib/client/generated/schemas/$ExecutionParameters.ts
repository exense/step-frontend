/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $ExecutionParameters = {
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
    plan: {
      type: 'Plan',
    },
    repositoryObject: {
      type: 'RepositoryObjectReference',
    },
    isolatedExecution: {
      type: 'boolean',
    },
    exports: {
      type: 'array',
      contains: {
        type: 'RepositoryObjectReference',
      },
    },
    description: {
      type: 'string',
    },
    id: {
      type: 'string',
      pattern: '[a-f0-9]{24}}',
    },
  },
} as const;
