import { ReportNodeWithArtefact } from '@exense/step-core';
import { ThreadGroupArtefact } from './thread-group.artefact';

export interface ThreadGroupReportNode extends ReportNodeWithArtefact<ThreadGroupArtefact> {
  threadGroupName: string;
}
