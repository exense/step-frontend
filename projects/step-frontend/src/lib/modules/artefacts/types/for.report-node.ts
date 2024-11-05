import { ReportNode } from '@exense/step-core';

export interface ForReportNode extends ReportNode {
  errorCount: number;
  count: number;
}
