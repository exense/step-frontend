/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $FindReferencesResponse = {
  properties: {
    type: {
      type: 'Enum',
    },
    id: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
    attributes: {
      type: 'dictionary',
      contains: {
        type: 'string',
      },
    },
  },
} as const;
