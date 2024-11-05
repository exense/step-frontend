import { ReportNode } from '@exense/step-core';

export interface RetryIfFailsReportNode extends ReportNode {
  tries: number;
  skipped: number;
  releasedToken: boolean;
}
