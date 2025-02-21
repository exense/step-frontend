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
    parentSource: {
      type: 'Enum',
    },
    singleInstanceReportNode: {
      type: 'ReportNode',
    },
  },
} as const;
