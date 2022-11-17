import { ReportNode } from '@exense/step-core';

export interface ReportNodeWithChildren extends ReportNode {
  children?: ReportNodeWithChildren[];
}
