/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $Plan = {
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
    root: {
      type: 'AbstractArtefact',
    },
    functions: {
      type: 'array',
      contains: {
        type: 'Function',
      },
    },
    subPlans: {
      type: 'array',
      contains: {
        type: 'Plan',
      },
    },
    agents: {
      type: 'AgentProvisioningConfiguration',
    },
    visible: {
      type: 'boolean',
    },
    activationExpression: {
      type: 'Expression',
    },
    categories: {
      type: 'array',
      contains: {
        type: 'string',
      },
    },
    id: {
      type: 'string',
      pattern: '[a-f0-9]{24}}',
    },
    _class: {
      type: 'string',
      isRequired: true,
    },
  },
} as const;
