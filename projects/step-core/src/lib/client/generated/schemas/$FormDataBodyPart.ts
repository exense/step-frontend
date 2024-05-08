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
    formDataContentDisposition: {
      type: 'FormDataContentDisposition',
    },
    simple: {
      type: 'boolean',
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
