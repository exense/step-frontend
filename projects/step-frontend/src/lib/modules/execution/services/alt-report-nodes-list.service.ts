import { Signal } from '@angular/core';
import { ReportNode } from '@exense/step-core';

export abstract class AltReportNodesListService {
  abstract reportNodes: Signal<ReportNode[]>;
}
