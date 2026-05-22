import { Directive, effect, inject, untracked } from '@angular/core';
import { AggregatedReportViewTreeSearchFacadeService } from '../services/aggregated-report-view-tree-search-facade.service';
import { AltExecutionTreeComponent } from '../components/alt-execution-tree/alt-execution-tree.component';
import { AggregatedReportViewTreeStateService } from '../services/aggregated-report-view-tree-state.service';

@Directive({
  selector: 'step-alt-execution-tree[stepAltExecutionTreeSearchFocus]',
})
export class AltExecutionTreeSearchFocusDirective {
  private _tree = inject(AltExecutionTreeComponent, { self: true });
  private _treeSearch = inject(AggregatedReportViewTreeSearchFacadeService);
  private _treeState = inject(AggregatedReportViewTreeStateService);

  private effectFocusNode = effect(() => {
    const foundItems = this._treeSearch.foundItems();
    const pageIndex = this._treeSearch.pageIndex();
    if (!foundItems) {
      return;
    }
    untracked(() => {
      const itemId = this._treeState.pickSearchResultItemByIndex(pageIndex);
      if (itemId) {
        this._tree.focusNode(itemId);
      }
    });
  });
}
