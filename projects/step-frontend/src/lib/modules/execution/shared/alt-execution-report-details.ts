export const ALT_EXECUTION_REPORT_DETAIL_KEYS = [
  'attachmentPreview',
  'agentRouting',
  'fullInputsOutputs',
  'description',
] as const;

export type AltExecutionReportDetailKey = (typeof ALT_EXECUTION_REPORT_DETAIL_KEYS)[number];

export type AltExecutionReportWidgetType = 'executionTree' | 'keywordsList';

export interface AltExecutionReportWidgetSettings {
  details?: AltExecutionReportDetailKey[];
}

export const hasAltExecutionReportDetail = (
  details: readonly string[] | undefined,
  key: AltExecutionReportDetailKey,
): boolean => !!details?.includes(key);
