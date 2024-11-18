import { Component, inject, output, viewChild } from '@angular/core';
import { ItemsPerPageService, ReportNode, SelectionCollector, TableSearch } from '@exense/step-core';
import { AltReportNodesStateService } from '../../services/alt-report-nodes-state.service';
import { AltKeywordNodesStateService } from '../../services/alt-keyword-nodes-state.service';
import { BaseAltReportNodeTableContentComponent } from '../alt-report-node-table-content/base-alt-report-node-table-content.component';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

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
  private _selectionCollector = inject<SelectionCollector<string, ReportNode>>(SelectionCollector);

  private _executionState = inject(AltExecutionStateService);

  protected readonly _keywordsState = inject(AltKeywordNodesStateService);

  protected tableSearch = viewChild('table', { read: TableSearch });

  protected readonly keywordsParameters$ = this._executionState.keywordParameters$;

  protected hasTestCasesFilter = toSignal(this._executionState.hasTestCasesFilter$, { initialValue: false });

  /** @Output() **/
  openKeywordInTreeView = output<ReportNode>();

  protected toggleDetail(node: ReportNode): void {
    this._keywordsState.toggleDetail(node);
  }

  protected clearTestCasesFilter(): void {
    this._selectionCollector.clear();
  }
}
