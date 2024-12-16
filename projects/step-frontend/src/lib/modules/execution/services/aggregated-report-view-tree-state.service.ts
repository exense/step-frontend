import { inject, Injectable, signal } from '@angular/core';
import { AggregatedReportView, AugmentedExecutionsService, DateRange, TreeStateService } from '@exense/step-core';
import { map, Observable } from 'rxjs';
import { AggregatedTreeNode } from '../shared/aggregated-tree-node';

@Injectable()
export class AggregatedReportViewTreeStateService extends TreeStateService<AggregatedReportView, AggregatedTreeNode> {
  private _executionsApi = inject(AugmentedExecutionsService);

  loadTree(executionId: string, dateRange?: DateRange): Observable<boolean> {
    return this.requestTree(executionId, dateRange).pipe(
      map((root) => {
        if (!root) {
          return false;
        }
        this.init(root, { expandAllByDefault: false });
        return true;
      }),
    );
  }

  private visibleInfosInternal = signal<Record<string, boolean>>({});
  readonly visibleInfos = this.visibleInfosInternal.asReadonly();

  toggleInfo(node: AggregatedTreeNode): void {
    const isVisible = !!this.visibleInfosInternal()[node.id!];
    this.visibleInfosInternal.update((value) => ({
      ...value,
      [node.id!]: !isVisible,
    }));
  }

  private requestTree(executionId: string, dateRange?: DateRange): Observable<AggregatedReportView> {
    if (!dateRange) {
      return this._executionsApi.getFullAggregatedReportView(executionId);
    }
    return this._executionsApi.getAggregatedReportView(executionId, {
      range: {
        from: dateRange.start?.toMillis(),
        to: dateRange.end?.toMillis(),
      },
    });
  }
}
