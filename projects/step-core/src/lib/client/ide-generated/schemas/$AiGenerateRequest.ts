/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $AiGenerateRequest = {
  properties: {
    testCases: {
      type: 'array',
      contains: {
        type: 'AiTestCaseInput',
      },
    },
    specText: {
      type: 'string',
    },
    hints: {
      type: 'string',
    },
  },
} as const;
