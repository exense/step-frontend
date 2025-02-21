import { AbstractArtefact, ReportNode } from '../client/step-client-module';

export interface ReportNodeWithArtefact<A extends AbstractArtefact> extends ReportNode {
  resolvedArtefact?: A;
}

export interface AggregatedArtefactInfo<T extends AbstractArtefact, R extends ReportNode = ReportNodeWithArtefact<T>> {
  originalArtefact?: T;
  singleInstanceReportNode?: R;
  countByStatus?: Record<string, number>;
}

export interface InlineArtefactContext<A extends AbstractArtefact, R extends ReportNode = ReportNodeWithArtefact<A>> {
  aggregatedInfo?: AggregatedArtefactInfo<A, R>;
  reportInfo?: R;
  isVertical?: boolean;
}
