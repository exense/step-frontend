import { Component, effect, inject, untracked, viewChild } from '@angular/core';
import { ElementSizeDirective, ReportNode, TreeStateService } from '@exense/step-core';
import {
  AGGREGATED_TREE_WIDGET_STATE,
  AggregatedReportViewTreeStateService,
} from '../../services/aggregated-report-view-tree-state.service';
import { AltExecutionTreeComponent } from '../alt-execution-tree/alt-execution-tree.component';
import { TREE_SEARCH_DESCRIPTION } from '../../services/tree-search-description.token';
import { AltReportNodesStateService } from '../../services/alt-report-nodes-state.service';
import { AltKeywordNodesStateService } from '../../services/alt-keyword-nodes-state.service';
import { AltReportNodesFilterService } from '../../services/alt-report-nodes-filter.service';
import { AggregatedReportViewTreeSearchFacadeService } from '../../services/aggregated-report-view-tree-search-facade.service';

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
    AggregatedReportViewTreeSearchFacadeService,
  ],
  hostDirectives: [ElementSizeDirective],
  standalone: false,
})
export class AltExecutionTreeWidgetComponent {
  private _treeState = inject(AggregatedReportViewTreeStateService);
  protected readonly _treeSearchDescription = inject(TREE_SEARCH_DESCRIPTION);
  protected readonly _treeSearch = inject(AggregatedReportViewTreeSearchFacadeService);

  private tree = viewChild('tree', { read: AltExecutionTreeComponent });

  private effectFocusNode = effect(() => {
    const foundItems = this._treeSearch.foundItems();
    const pageIndex = this._treeSearch.pageIndex();
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

  focusAndSearch(query: string) {
    this._treeSearch.searchCtrl.setValue(query ?? '');
  }

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
