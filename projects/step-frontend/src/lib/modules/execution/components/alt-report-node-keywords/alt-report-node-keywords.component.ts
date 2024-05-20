import { Component, inject, output } from '@angular/core';
import { AltReportNodesListService } from '../../services/alt-report-nodes-list.service';
import { ReportNode } from '@exense/step-core';

@Component({
  selector: 'step-alt-report-node-keywords',
  templateUrl: './alt-report-node-keywords.component.html',
  styleUrl: './alt-report-node-keywords.component.scss',
})
export class AltReportNodeKeywordsComponent {
  _keywords = inject(AltReportNodesListService).reportNodes;

  /** @Output() **/
  openKeywordInTreeView = output<ReportNode>();
}
