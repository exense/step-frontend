/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $ChildrenBlock = {
  properties: {
    continueOnError: {
      type: 'DynamicValueBoolean',
    },
    steps: {
      type: 'array',
      contains: {
        type: 'AbstractArtefact',
      },
    },
  },
} as const;
