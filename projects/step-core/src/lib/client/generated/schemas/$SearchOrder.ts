/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $SearchOrder = {
  properties: {
    fieldsSearchOder: {
      type: 'array',
      contains: {
        type: 'FieldSearchOrder',
      },
    },
  },
} as const;
