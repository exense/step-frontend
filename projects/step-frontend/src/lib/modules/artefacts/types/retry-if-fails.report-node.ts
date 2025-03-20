import { ReportNodeWithArtefact } from '@exense/step-core';
import { RetryIfFailsArtefact } from './retry-if-fails.artefact';

export interface RetryIfFailsReportNode extends ReportNodeWithArtefact<RetryIfFailsArtefact> {
  tries: number;
  skipped: number;
  releasedToken: boolean;
}
