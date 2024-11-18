import { Component, inject, output, viewChild } from '@angular/core';
import { ItemsPerPageService, ReportNode, SelectionCollector, TableSearch } from '@exense/step-core';
import { AltReportNodesStateService } from '../../services/alt-report-nodes-state.service';
import { AltTestCasesNodesStateService } from '../../services/alt-test-cases-nodes-state.service';
import { BaseAltReportNodeTableContentComponent } from '../alt-report-node-table-content/base-alt-report-node-table-content.component';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { toSignal } from '@angular/core/rxjs-interop';

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
  private _executionState = inject(AltExecutionStateService);
  private _selectionCollector = inject<SelectionCollector<string, ReportNode>>(SelectionCollector);
  protected tableSearch = viewChild('table', { read: TableSearch });
  showAllOperations = false;

  /** @Output() **/
  readonly openTestCaseInTreeView = output<ReportNode>();

  protected hasTestCasesFilter = toSignal(this._executionState.hasTestCasesFilter$, { initialValue: false });

  protected toggleSelection(item: ReportNode, $event: MouseEvent): void {
    if (!$event.shiftKey) {
      this._selectionCollector.clear();
    }
    this._selectionCollector.toggleSelection(item);
  }
}
