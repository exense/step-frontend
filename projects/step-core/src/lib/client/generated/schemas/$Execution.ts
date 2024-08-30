/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $Execution = {
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
    startTime: {
      type: 'number',
      format: 'int64',
    },
    endTime: {
      type: 'number',
      format: 'int64',
    },
    description: {
      type: 'string',
    },
    executionType: {
      type: 'string',
    },
    status: {
      type: 'Enum',
    },
    result: {
      type: 'Enum',
    },
    lifecycleErrors: {
      type: 'array',
      contains: {
        type: 'Error',
      },
    },
    planId: {
      type: 'string',
    },
    importResult: {
      type: 'ImportResult',
    },
    reportExports: {
      type: 'array',
      contains: {
        type: 'ReportExport',
      },
    },
    executionTaskID: {
      type: 'string',
    },
    parameters: {
      type: 'dictionary',
      contains: {
        type: 'string',
      },
    },
    executionParameters: {
      type: 'ExecutionParameters',
    },
    executiontTaskParameters: {
      type: 'ExecutiontTaskParameters',
    },
    resolvedPlanRootNodeId: {
      type: 'string',
    },
    id: {
      type: 'string',
      pattern: '[a-f0-9]{24}}',
    },
  },
} as const;
