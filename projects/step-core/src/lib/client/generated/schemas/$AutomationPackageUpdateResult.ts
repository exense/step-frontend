/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $AutomationPackageUpdateResult = {
  properties: {
    status: {
      type: 'Enum',
    },
    id: {
      type: 'string',
      pattern: '[a-f0-9]{24}}',
    },
    conflictingAutomationPackages: {
      type: 'ConflictingAutomationPackages',
    },
    warnings: {
      type: 'array',
      contains: {
        type: 'string',
      },
    },
  },
} as const;
