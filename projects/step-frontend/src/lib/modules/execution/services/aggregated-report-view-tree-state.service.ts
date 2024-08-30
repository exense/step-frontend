import { inject, Injectable } from '@angular/core';
import { AggregatedReportView, AugmentedExecutionsService, TreeStateService } from '@exense/step-core';
import { map, Observable } from 'rxjs';
import { AggregatedTreeNode } from '../shared/aggregated-tree-node';

@Injectable()
export class AggregatedReportViewTreeStateService extends TreeStateService<AggregatedReportView, AggregatedTreeNode> {
  private _executionsApi = inject(AugmentedExecutionsService);

  loadTree(executionId: string): Observable<boolean> {
    return this._executionsApi.getFullAggregatedReportView(executionId).pipe(
      map((root) => {
        if (!root) {
          return false;
        }
        this.init(root, { expandAllByDefault: false });
        return true;
      }),
    );
  }
}
