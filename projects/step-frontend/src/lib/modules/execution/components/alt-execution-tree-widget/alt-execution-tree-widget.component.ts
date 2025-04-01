import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { TreeStateService } from '@exense/step-core';
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

  protected readonly searchCtrl = this._treeState.searchCtrl;

  private tree = viewChild('tree', { read: AltExecutionTreeComponent });

  protected readonly foundItems = computed(() => this._treeState.searchResult().length);
  protected readonly pageIndex = signal(0);

  protected handleSearchResultPage(index: number): void {
    this.pageIndex.set(index);
    const itemId = this._treeState.pickSearchResultItemByIndex(index);
    if (itemId) {
      this.focusNode(itemId);
    }
  }

  focusNode(nodeId: string): void {
    this.tree()?.focusNode(nodeId);
  }

  protected collapseAll(): void {
    this._treeState.collapseAll();
  }

  protected expandAll(): void {
    this._treeState.expandAll();
  }
}
