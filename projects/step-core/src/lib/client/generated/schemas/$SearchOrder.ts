/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $SearchOrder = {
  properties: {
    fieldsSearchOrder: {
      type: 'array',
      contains: {
        type: 'FieldSearchOrder',
      },
    },
  },
} as const;
