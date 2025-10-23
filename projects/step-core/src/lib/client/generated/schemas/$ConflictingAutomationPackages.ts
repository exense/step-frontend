/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $ConflictingAutomationPackages = {
  properties: {
    apWithSameOrigin: {
      type: 'array',
      contains: {
        type: 'string',
        pattern: '[a-f0-9]{24}}',
      },
    },
    apWithSameLibrary: {
      type: 'array',
      contains: {
        type: 'string',
        pattern: '[a-f0-9]{24}}',
      },
    },
  },
} as const;
