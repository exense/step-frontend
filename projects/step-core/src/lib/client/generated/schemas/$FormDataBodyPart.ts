/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $FormDataBodyPart = {
  properties: {
    contentDisposition: {
      type: 'ContentDisposition',
    },
    entity: {
      properties: {},
    },
    headers: {
      type: 'dictionary',
      contains: {
        type: 'array',
        contains: {
          type: 'string',
        },
      },
    },
    mediaType: {
      type: 'MediaType',
    },
    messageBodyWorkers: {
      type: 'MessageBodyWorkers',
    },
    parent: {
      type: 'MultiPart',
    },
    providers: {
      type: 'Providers',
    },
    name: {
      type: 'string',
    },
    value: {
      type: 'string',
    },
    content: {
      properties: {},
    },
    fileName: {
      type: 'string',
    },
    simple: {
      type: 'boolean',
    },
    formDataContentDisposition: {
      type: 'FormDataContentDisposition',
    },
    parameterizedHeaders: {
      type: 'dictionary',
      contains: {
        type: 'array',
        contains: {
          type: 'ParameterizedHeader',
        },
      },
    },
  },
} as const;
