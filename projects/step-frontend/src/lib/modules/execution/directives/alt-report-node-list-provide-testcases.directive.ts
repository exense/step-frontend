import { Directive } from '@angular/core';
import { AltReportNodesStateService } from '../services/alt-report-nodes-state.service';
import { AltTestCasesNodesStateService } from '../services/alt-test-cases-nodes-state.service';
import { AltReportNodesFilterService } from '../services/alt-report-nodes-filter.service';

@Directive({
  selector: '[stepAltReportNodeListProvideTestcases]',
  providers: [
    {
      provide: AltReportNodesStateService,
      useExisting: AltTestCasesNodesStateService,
    },
    {
      provide: AltReportNodesFilterService,
      useExisting: AltReportNodesStateService,
    },
  ],
})
export class AltReportNodeListProvideTestcasesDirective {}
