import { Component, computed, effect, inject, untracked, viewChild } from '@angular/core';
import { PaginatorComponent, TreeStateService } from '@exense/step-core';
import {
  AGGREGATED_TREE_WIDGET_STATE,
  AggregatedReportViewTreeStateService,
} from '../../services/aggregated-report-view-tree-state.service';
import { AltExecutionTreeComponent } from '../alt-execution-tree/alt-execution-tree.component';
import { PageEvent } from '@angular/material/paginator';

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
  private paginator = viewChild('paginator', { read: PaginatorComponent });

  protected readonly foundItems = computed(() => this._treeState.searchResult().length);
  protected readonly hasOccurrences = computed(() => this.foundItems() > 0);

  private effectSearchChange = effect(
    () => {
      const searchResult = this._treeState.searchResult();
      const paginator = untracked(() => this.paginator());
      paginator?.firstPage();
    },
    { allowSignalWrites: true },
  );

  protected handleSearchResultPage(page: PageEvent): void {
    const index = page.pageIndex;
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
