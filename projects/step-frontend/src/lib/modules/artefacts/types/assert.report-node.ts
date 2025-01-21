import { ReportNode } from '@exense/step-core';

export interface AssertReportNode extends ReportNode {
  message: string;
  description: string;
  key: string;
  actual: string;
  expected: string;
}
