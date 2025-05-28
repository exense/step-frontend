/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $FlatAggregatedReportView = {
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
