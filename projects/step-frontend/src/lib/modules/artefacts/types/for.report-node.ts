import { ReportNodeWithArtefact } from '@exense/step-core';
import { ForArtefact } from './for.artefact';

export interface ForReportNode extends ReportNodeWithArtefact<ForArtefact> {
  errorCount: number;
  count: number;
}
