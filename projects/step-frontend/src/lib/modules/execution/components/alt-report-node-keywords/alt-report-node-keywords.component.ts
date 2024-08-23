import { Component, inject, output, viewChild } from '@angular/core';
import { ItemsPerPageService, ReportNode, TableReload, TableSearch } from '@exense/step-core';
import { AltReportNodesStateService } from '../../services/alt-report-nodes-state.service';
import { AltKeywordNodesStateService } from '../../services/alt-keyword-nodes-state.service';
import { BaseAltReportNodeTableContentComponent } from '../alt-report-node-table-content/base-alt-report-node-table-content.component';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';

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
  private _executionState = inject(AltExecutionStateService);

  protected tableSearch = viewChild('table', { read: TableSearch });

  protected readonly keywordsParameters$ = this._executionState.keywordParameters$;

  /** @Output() **/
  openKeywordInTreeView = output<ReportNode>();

  /** @Output() **/
  openKeywordDrilldown = output<ReportNode>();
}
