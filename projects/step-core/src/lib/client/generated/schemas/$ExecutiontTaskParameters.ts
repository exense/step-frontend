/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $ExecutiontTaskParameters = {
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
    name: {
      type: 'string',
    },
    executionsParameters: {
      type: 'ExecutionParameters',
    },
    assertionPlan: {
      type: 'string',
      pattern: '[a-f0-9]{24}}',
    },
    cronExpression: {
      type: 'string',
    },
    cronExclusions: {
      type: 'array',
      contains: {
        type: 'CronExclusion',
      },
    },
    active: {
      type: 'boolean',
    },
    id: {
      type: 'string',
      pattern: '[a-f0-9]{24}}',
    },
  },
} as const;
