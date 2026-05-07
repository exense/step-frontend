import { Measure, ReportNode } from '@exense/step-core';
import { KeywordArtefact } from './keyword.artefact';
import { AssertReportNode } from './assert.report-node';

export interface KeywordReportNode extends ReportNode {
  functionId: string;
  functionAttributes: Record<string, string>;
  agentUrl: string;
  tokenId: string;
  input: string;
  output: string;
  measures?: Measure[];
  assertionReportNodesOnError?: AssertReportNode[];
  resolvedArtefact?: KeywordArtefact;
}
