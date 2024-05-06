/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $TokenProvisioningStatus = {
  properties: {
    statusDescription: {
      type: 'string',
    },
    tokenCountStarted: {
      type: 'number',
      format: 'int32',
    },
    tokenCountTarget: {
      type: 'number',
      format: 'int32',
    },
  },
} as const;
