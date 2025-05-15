/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $Operation = {
  properties: {
    name: {
      type: 'string',
    },
    start: {
      type: 'string',
      format: 'date-time',
    },
    details: {
      properties: {},
    },
    reportNodeId: {
      type: 'string',
    },
    artefactHash: {
      type: 'string',
    },
    tid: {
      type: 'number',
      format: 'int64',
    },
  },
} as const;
