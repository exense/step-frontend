import { Component, inject, viewChild } from '@angular/core';
import { ReportNode, TreeStateService } from '@exense/step-core';
import {
  AGGREGATED_TREE_WIDGET_STATE,
  AggregatedReportViewTreeStateService,
} from '../../services/aggregated-report-view-tree-state.service';
import { AltExecutionTreeComponent } from '../alt-execution-tree/alt-execution-tree.component';

@Component({
  selector: 'step-alt-execution-tree-widget',
  templateUrl: './alt-execution-tree-widget.component.html',
  styleUrl: './alt-execution-tree-widget.component.scss',
  providers: [
    {
      provide: TreeStateService,
      useExisting: AGGREGATED_TREE_WIDGET_STATE,
    },
    {
      provide: AggregatedReportViewTreeStateService,
      useExisting: AGGREGATED_TREE_WIDGET_STATE,
    },
  ],
})
export class AltExecutionTreeWidgetComponent {
  private _treeState = inject(AggregatedReportViewTreeStateService);

  /** @ViewChild **/
  private tree = viewChild('tree', { read: AltExecutionTreeComponent });

  focusNodeById(nodeId: string): void {
    this.tree()?.focusNode(nodeId);
  }

  focusNodeByReport(report: ReportNode): void {
    const node = this._treeState
      .findNodesByArtefactId(report.artefactID)
      .find((item) => item.artefactHash === report.artefactHash);
    if (!node?.id) {
      return;
    }
    this.focusNodeById(node.id);
  }

  protected collapseAll(): void {
    this._treeState.collapseAll();
  }

  protected expandAll(): void {
    this._treeState.expandAll();
  }
}
