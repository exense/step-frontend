/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $ContentDisposition = {
  properties: {
    type: {
      type: 'string',
    },
    parameters: {
      type: 'dictionary',
      contains: {
        type: 'string',
      },
    },
    fileName: {
      type: 'string',
    },
    creationDate: {
      type: 'string',
      format: 'date-time',
    },
    modificationDate: {
      type: 'string',
      format: 'date-time',
    },
    readDate: {
      type: 'string',
      format: 'date-time',
    },
    size: {
      type: 'number',
      format: 'int64',
    },
  },
} as const;
