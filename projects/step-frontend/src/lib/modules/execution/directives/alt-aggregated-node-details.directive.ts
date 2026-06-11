import { computed, Directive, inject, input, linkedSignal } from '@angular/core';
import { AggregatedTreeNode } from '../shared/aggregated-tree-node';
import { AltExecutionNodesHelperService } from '../services/alt-execution-nodes-helper.service';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { filter, map, switchMap } from 'rxjs';
import { HashContainer } from '../components/aggregated-tree-node-history/aggregated-tree-node-history.component';

@Directive({
  selector: '[stepAltAggregatedNodeDetails]',
})
export class AltAggregatedNodeDetailsDirective {
  private _executionNodesHelper = inject(AltExecutionNodesHelperService);

  readonly node = input.required<AggregatedTreeNode>();

  readonly aggregatedNode = linkedSignal(() => this.node());

  readonly historyHashContainer = computed<HashContainer | undefined>(() => {
    const aggregatedNode = this.aggregatedNode();
    if (!aggregatedNode?.artefactHash) {
      return undefined;
    }
    return { artefactHash: aggregatedNode.artefactHash };
  });

  private aggregateNodeUpdateSubscription = toObservable(this.node)
    .pipe(
      map((node) => node.id),
      switchMap((id) => this._executionNodesHelper.getAggregatedNode(id)),
      filter((updatedResult) => !!updatedResult),
      takeUntilDestroyed(),
    )
    .subscribe((updatedResult) => {
      this.aggregatedNode.set(updatedResult);
    });
}
