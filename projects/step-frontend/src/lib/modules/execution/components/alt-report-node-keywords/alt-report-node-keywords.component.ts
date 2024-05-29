import { Component, input, output } from '@angular/core';
import { ItemsPerPageService, ReportNode } from '@exense/step-core';
import { AltReportNodesStateService } from '../../services/alt-report-nodes-state.service';
import { AltKeywordNodesStateService } from '../../services/alt-keyword-nodes-state.service';
import { BaseAltReportNodeTableContentComponent } from '../alt-report-node-table-content/base-alt-report-node-table-content.component';
import { ViewMode } from '../../shared/view-mode';

@Component({
  selector: 'step-alt-report-node-keywords',
  templateUrl: './alt-report-node-keywords.component.html',
  styleUrl: './alt-report-node-keywords.component.scss',
  providers: [
    {
      provide: AltReportNodesStateService,
      useExisting: AltKeywordNodesStateService,
    },
    {
      provide: ItemsPerPageService,
      useExisting: AltReportNodeKeywordsComponent,
    },
  ],
})
export class AltReportNodeKeywordsComponent extends BaseAltReportNodeTableContentComponent {
  /** @Input() **/
  mode = input<ViewMode>(ViewMode.VIEW);

  /** @Output() **/
  openKeywordInTreeView = output<ReportNode>();

  /** @Output() **/
  openKeywordDrilldown = output<ReportNode>();
}
