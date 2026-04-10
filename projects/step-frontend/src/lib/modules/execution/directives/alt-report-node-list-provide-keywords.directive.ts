import { Directive } from '@angular/core';
import { AltReportNodesStateService } from '../services/alt-report-nodes-state.service';
import { AltKeywordNodesStateService } from '../services/alt-keyword-nodes-state.service';
import { AltReportNodesFilterService } from '../services/alt-report-nodes-filter.service';

@Directive({
  selector: '[stepAltReportNodesProvideKeywords]',
  providers: [
    {
      provide: AltReportNodesStateService,
      useExisting: AltKeywordNodesStateService,
    },
    {
      provide: AltReportNodesFilterService,
      useExisting: AltReportNodesStateService,
    },
  ],
})
export class AltReportNodeListProvideKeywordsDirective {}
