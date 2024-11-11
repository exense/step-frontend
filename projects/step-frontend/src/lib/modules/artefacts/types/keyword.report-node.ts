import { ReportNode } from '@exense/step-core';

export interface KeywordReportNode extends ReportNode {
  functionId: string;
  functionAttributes: Record<string, string>;
  agentUrl: string;
  tokenId: string;
  input: string;
  output: string;
}
