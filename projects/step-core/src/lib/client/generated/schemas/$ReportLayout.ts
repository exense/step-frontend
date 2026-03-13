/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $ReportLayout = {
  properties: {
    layout: {
      type: 'dictionary',
      contains: {
        type: 'JsonValue',
      },
    },
    visibility: {
      type: 'Enum',
    },
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
    creationDate: {
      type: 'string',
      format: 'date-time',
    },
    creationUser: {
      type: 'string',
    },
    lastModificationDate: {
      type: 'string',
      format: 'date-time',
    },
    lastModificationUser: {
      type: 'string',
    },
    id: {
      type: 'string',
      pattern: '[a-f0-9]{24}}',
    },
  },
} as const;
