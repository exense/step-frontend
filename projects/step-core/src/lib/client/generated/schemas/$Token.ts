/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $Token = {
  properties: {
    id: {
      type: 'string',
    },
    agentid: {
      type: 'string',
    },
    attributes: {
      type: 'dictionary',
      contains: {
        type: 'string',
      },
    },
    selectionPatterns: {
      type: 'dictionary',
      contains: {
        type: 'Interest',
      },
    },
  },
} as const;
