/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $MultiPart = {
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
    bodyParts: {
      type: 'array',
      contains: {
        type: 'BodyPart',
      },
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
