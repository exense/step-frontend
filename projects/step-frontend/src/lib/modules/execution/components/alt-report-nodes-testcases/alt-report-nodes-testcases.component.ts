import { Component, inject } from '@angular/core';
import { AltReportNodesListService } from '../../services/alt-report-nodes-list.service';

@Component({
  selector: 'step-alt-report-nodes-testcases',
  templateUrl: './alt-report-nodes-testcases.component.html',
  styleUrl: './alt-report-nodes-testcases.component.scss',
})
export class AltReportNodesTestcasesComponent {
  _testcases = inject(AltReportNodesListService).reportNodes;
  showAllOperations = false;
}
