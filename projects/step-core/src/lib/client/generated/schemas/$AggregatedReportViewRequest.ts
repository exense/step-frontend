/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $AggregatedReportViewRequest = {
  properties: {
    range: {
      type: 'Range',
    },
    resolveSingleInstanceReport: {
      type: 'boolean',
    },
    selectedReportNodeId: {
      type: 'string',
    },
    filterResolvedPlanNodes: {
      type: 'boolean',
    },
    filterArtefactClasses: {
      type: 'array',
      contains: {
        type: 'string',
      },
    },
    fetchCurrentOperations: {
      type: 'boolean',
    },
  },
} as const;
