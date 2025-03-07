import { ReportNodeWithArtefact } from '@exense/step-core';
import { WhileArtefact } from './while.artefact';

export interface WhileReportNode extends ReportNodeWithArtefact<WhileArtefact> {
  errorCount: number;
  count: number;
}
