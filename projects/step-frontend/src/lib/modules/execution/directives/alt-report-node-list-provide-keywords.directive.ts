import { Directive } from '@angular/core';
import { AltReportNodesSummaryStateService } from '../services/alt-report-nodes-summary-state.service';
import { AltKeywordNodesStateService } from '../services/alt-keyword-nodes-state.service';
import { AltReportNodesFilterService } from '../services/alt-report-nodes-filter.service';
import { AltReportNodesStateService } from '../services/alt-report-nodes-state.service';

@Directive({
  selector: '[stepAltReportNodesProvideKeywords]',
  providers: [
    {
      provide: AltReportNodesSummaryStateService,
      useExisting: AltKeywordNodesStateService,
    },
    {
      provide: AltReportNodesStateService,
      useExisting: AltReportNodesSummaryStateService,
    },
    {
      provide: AltReportNodesFilterService,
      useExisting: AltReportNodesSummaryStateService,
    },
  ],
})
export class AltReportNodeListProvideKeywordsDirective {}
