import { Signal } from '@angular/core';
import { ReportNode } from '@exense/step-core';
import { Observable } from 'rxjs';

export abstract class AltReportNodesListService {
  abstract reportNodes: Signal<ReportNode[]>;
  abstract reportNodes$: Observable<ReportNode[]>;
}
