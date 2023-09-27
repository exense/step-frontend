/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $TokenWrapper = {
  properties: {
    token: {
      type: 'Token',
    },
    agent: {
      type: 'AgentRef',
    },
    tokenHealth: {
      type: 'TokenHealth',
    },
    state: {
      type: 'Enum',
    },
    currentOwner: {
      type: 'TokenWrapperOwner',
    },
    interests: {
      type: 'dictionary',
      contains: {
        type: 'Interest',
      },
    },
    attributes: {
      type: 'dictionary',
      contains: {
        type: 'string',
      },
    },
  },
} as const;
