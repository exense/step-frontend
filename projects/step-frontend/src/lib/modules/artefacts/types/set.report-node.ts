import { ReportNodeWithArtefact } from '@exense/step-core';
import { SetArtefact } from './set.artefact';

export interface SetReportNode extends ReportNodeWithArtefact<SetArtefact> {
  key: string;
  value: string;
}
