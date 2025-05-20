import { Component, computed, effect, inject, signal, untracked, viewChild } from '@angular/core';
import { ReportNode, TreeStateService } from '@exense/step-core';
import {
  AGGREGATED_TREE_WIDGET_STATE,
  AggregatedReportViewTreeStateService,
} from '../../services/aggregated-report-view-tree-state.service';
import { AltExecutionTreeComponent } from '../alt-execution-tree/alt-execution-tree.component';
import { TREE_SEARCH_DESCRIPTION } from '../../services/tree-search-description.token';
import { AltReportNodesStateService } from '../../services/alt-report-nodes-state.service';
import { AltKeywordNodesStateService } from '../../services/alt-keyword-nodes-state.service';
import { AltReportNodesFilterService } from '../../services/alt-report-nodes-filter.service';

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
    {
      provide: AltReportNodesFilterService,
      useExisting: AltKeywordNodesStateService,
    },
    {
      provide: AltReportNodesStateService,
      useExisting: AltKeywordNodesStateService,
    },
  ],
})
export class AltExecutionTreeWidgetComponent {
  private _treeState = inject(AggregatedReportViewTreeStateService);
  protected readonly _treeSearchDescription = inject(TREE_SEARCH_DESCRIPTION);

  protected readonly searchCtrl = this._treeState.searchCtrl;

  private tree = viewChild('tree', { read: AltExecutionTreeComponent });

  protected readonly foundItems = computed(() => this._treeState.searchResult().length);
  protected readonly pageIndex = signal(0);

  private effectFocusNode = effect(() => {
    const foundItems = this.foundItems();
    const pageIndex = this.pageIndex();
    if (!foundItems) {
      return;
    }
    untracked(() => {
      const itemId = this._treeState.pickSearchResultItemByIndex(pageIndex);
      if (itemId) {
        this.focusNodeById(itemId);
      }
    });
  });

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

  focusNodeByArtefactId(artefactId: string): void {
    const nodeId = this._treeState.getNodeIdsByArtefactId(artefactId)[0];
    if (!nodeId) {
      return;
    }
    this.focusNodeById(nodeId);
  }

  protected collapseAll(): void {
    this._treeState.collapseAll();
  }

  protected expandAll(): void {
    this._treeState.expandAll();
  }
}
