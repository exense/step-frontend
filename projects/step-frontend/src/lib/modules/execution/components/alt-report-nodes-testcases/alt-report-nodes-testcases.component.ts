import { Component, input } from '@angular/core';
import { ItemsPerPageService } from '@exense/step-core';
import { AltReportNodesStateService } from '../../services/alt-report-nodes-state.service';
import { AltTestCasesNodesStateService } from '../../services/alt-test-cases-nodes-state.service';
import { BaseAltReportNodeTableContentComponent } from '../alt-report-node-table-content/base-alt-report-node-table-content.component';
import { ViewMode } from '../../shared/view-mode';

@Component({
  selector: 'step-alt-report-nodes-testcases',
  templateUrl: './alt-report-nodes-testcases.component.html',
  styleUrl: './alt-report-nodes-testcases.component.scss',
  providers: [
    {
      provide: AltReportNodesStateService,
      useExisting: AltTestCasesNodesStateService,
    },
    {
      provide: ItemsPerPageService,
      useExisting: AltReportNodesTestcasesComponent,
    },
  ],
})
export class AltReportNodesTestcasesComponent extends BaseAltReportNodeTableContentComponent {
  /** @Input() **/
  mode = input<ViewMode>(ViewMode.VIEW);

  showAllOperations = false;
}
