import { Directive } from '@angular/core';
import { AltReportNodesSummaryStateService } from '../services/alt-report-nodes-summary-state.service';
import { AltTestCasesNodesStateService } from '../services/alt-test-cases-nodes-state.service';
import { AltReportNodesFilterService } from '../services/alt-report-nodes-filter.service';
import { AltReportNodesStateService } from '../services/alt-report-nodes-state.service';

@Directive({
  selector: '[stepAltReportNodeListProvideTestcases]',
  providers: [
    {
      provide: AltReportNodesSummaryStateService,
      useExisting: AltTestCasesNodesStateService,
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
export class AltReportNodeListProvideTestcasesDirective {}
