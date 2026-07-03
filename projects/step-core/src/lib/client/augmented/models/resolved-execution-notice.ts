export type ExecutionNoticeSeverity = 'INFO' | 'WARNING' | 'ERROR';

export interface ResolvedExecutionNotice {
  /** e.g. "timeseries.label-cardinality-quota-exceeded" */
  typeId: string;
  /** free-form grouping, e.g. "cardinality" | "system" | "unknown" */
  category: string;
  severity: ExecutionNoticeSeverity;
  /** Sanitized HTML rendered server-side. Render as HTML, not text. */
  message: string;
  /** epoch millis */
  timestamp: number;
}
