/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $LookupCallPlanRequest = {
  properties: {
    callPlan: {
      type: 'CallPlan',
    },
    bindings: {
      type: 'dictionary',
      contains: {
        properties: {},
      },
    },
  },
} as const;
