import { ReportNodeWithArtefact } from '@exense/step-core';
import { EchoArtefact } from './echo.artefact';

export interface EchoReportNode extends ReportNodeWithArtefact<EchoArtefact> {
  echo: string;
}
