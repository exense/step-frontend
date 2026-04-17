import { Directive } from '@angular/core';
import { AltReportNodesSummaryStateService } from '../services/alt-report-nodes-summary-state.service';
import { AltReportNodesFilterService } from '../services/alt-report-nodes-filter.service';
import { AltReportNodesStateService } from '../services/alt-report-nodes-state.service';
import { AltTestCasesDetailsNodesStateService } from '../services/alt-test-cases-details-nodes-state.service';

@Directive({
  selector: '[stepAltReportNodeListProvideTestcasesDetails]',
  providers: [
    AltTestCasesDetailsNodesStateService,
    {
      provide: AltReportNodesSummaryStateService,
      useExisting: AltTestCasesDetailsNodesStateService,
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
export class AltReportNodeListProvideTestcasesDetailsDirective {}
