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
  },
} as const;
