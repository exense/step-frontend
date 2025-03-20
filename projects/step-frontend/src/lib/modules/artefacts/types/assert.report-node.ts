import { ReportNodeWithArtefact } from '@exense/step-core';
import { AssertArtefact } from './assert.artefact';

export interface AssertReportNode extends ReportNodeWithArtefact<AssertArtefact> {
  message: string;
  description: string;
  key: string;
  actual: string;
  expected: string;
}
