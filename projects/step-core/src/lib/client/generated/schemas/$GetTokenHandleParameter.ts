/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $GetTokenHandleParameter = {
  properties: {
    attributes: {
      type: 'dictionary',
      contains: {
        type: 'string',
      },
    },
    interests: {
      type: 'dictionary',
      contains: {
        type: 'Interest',
      },
    },
    createSession: {
      type: 'boolean',
    },
    local: {
      type: 'boolean',
    },
    reservationDescription: {
      type: 'string',
    },
    skipAutoProvisioning: {
      type: 'boolean',
    },
  },
} as const;
