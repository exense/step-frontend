/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $CallFunction = {
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
    dynamicName: {
      type: 'DynamicValueString',
    },
    useDynamicName: {
      type: 'boolean',
    },
    description: {
      type: 'string',
    },
    children: {
      type: 'array',
      contains: {
        type: 'AbstractArtefact',
      },
    },
    customAttributes: {
      type: 'dictionary',
      contains: {
        properties: {},
      },
    },
    attachments: {
      type: 'array',
      contains: {
        type: 'string',
        pattern: '[a-f0-9]{24}}',
      },
    },
    skipNode: {
      type: 'DynamicValueBoolean',
    },
    instrumentNode: {
      type: 'DynamicValueBoolean',
    },
    continueParentNodeExecutionOnError: {
      type: 'DynamicValueBoolean',
    },
    before: {
      type: 'ChildrenBlock',
    },
    after: {
      type: 'ChildrenBlock',
    },
    remote: {
      type: 'DynamicValueBoolean',
    },
    token: {
      type: 'DynamicValueString',
    },
    function: {
      type: 'DynamicValueString',
    },
    argument: {
      type: 'DynamicValueString',
    },
    resultMap: {
      type: 'DynamicValueString',
    },
    id: {
      type: 'string',
      pattern: '[a-f0-9]{24}}',
    },
  },
} as const;
