import { Injectable } from '@angular/core';
import { AltReportNodesFilterService } from './alt-report-nodes-filter.service';

@Injectable()
export class AggregatedReportViewTreeFilterService extends AltReportNodesFilterService {
  constructor() {
    super('report-view-tree');
  }
}
