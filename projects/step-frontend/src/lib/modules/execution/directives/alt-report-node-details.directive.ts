import { Directive, inject, input, linkedSignal } from '@angular/core';
import { ReportNode } from '@exense/step-core';
import { AltExecutionNodesHelperService } from '../services/alt-execution-nodes-helper.service';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { filter, map, switchMap } from 'rxjs';

@Directive({
  selector: '[stepAltReportNodeDetails]',
})
export class AltReportNodeDetailsDirective<R extends ReportNode = ReportNode> {
  private _executionNodesHelper = inject(AltExecutionNodesHelperService);

  readonly node = input.required<R>();

  readonly reportNode = linkedSignal(() => this.node());

  private nodeRefreshSubscription = toObservable(this.node)
    .pipe(
      map((node) => node.id!),
      switchMap((id) => this._executionNodesHelper.getReportNodeUpdatable<R>(id)),
      filter((updatedNode) => !!updatedNode),
      takeUntilDestroyed(),
    )
    .subscribe((updatedNode) => this.reportNode.set(updatedNode));
}
