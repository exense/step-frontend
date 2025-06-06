/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $AggregatedReportView = {
  properties: {
    artefact: {
      type: 'AbstractArtefact',
    },
    artefactHash: {
      type: 'string',
    },
    countByStatus: {
      type: 'dictionary',
      contains: {
        type: 'number',
        format: 'int64',
      },
    },
    children: {
      type: 'array',
      contains: {
        type: 'AggregatedReportView',
      },
    },
    hasDescendantInvocations: {
      type: 'boolean',
    },
    parentSource: {
      type: 'Enum',
    },
    singleInstanceReportNode: {
      type: 'ReportNode',
    },
    bucketsByStatus: {
      type: 'dictionary',
      contains: {
        type: 'Bucket',
      },
    },
    currentOperations: {
      type: 'array',
      contains: {
        type: 'Operation',
      },
    },
  },
} as const;
