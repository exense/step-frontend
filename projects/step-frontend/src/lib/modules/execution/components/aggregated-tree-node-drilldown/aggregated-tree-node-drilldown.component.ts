import { Component, inject, signal, untracked, ViewEncapsulation } from '@angular/core';
import { AggregatedTreeNode } from '../../shared/aggregated-tree-node';
import { filter, map, switchMap } from 'rxjs';
import { ReportNode } from '@exense/step-core';
import { Status } from '../../../_common/shared/status.enum';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { AltExecutionNodesHelperService } from '../../services/alt-execution-nodes-helper.service';
import { AltExecutionDialogsService, PartialOpenIterationsParams } from '../../services/alt-execution-dialogs.service';
import { NODE_DETAILS_RELATIVE_PARENT } from '../../services/node-details-relative-parent.token';
import { DOCUMENT } from '@angular/common';

interface DrilldownData {
  aggregatedNodeId?: string;
  resolvedPartialPath?: string;
  reportNodeId?: string;
  searchStatus?: Status;
  searchStatusCount?: number;
}

enum StackItemType {
  ROOT = 'root',
  REPORT_NODE = 'reportNode',
  AGGREGATED_REPORT_NODE = 'aggregatedReportNode',
}

type StackItem =
  | {
      id: string;
      type: StackItemType.ROOT;
    }
  | {
      id: string;
      type: StackItemType.REPORT_NODE;
      data: ReportNode;
    }
  | {
      id: string;
      type: StackItemType.AGGREGATED_REPORT_NODE;
      data: AggregatedTreeNode;
      resolvedPartialPath?: string;
      searchStatus?: Status;
      searchStatusCount?: number;
    };

@Component({
  selector: 'step-aggregated-tree-node-drilldown',
  templateUrl: './aggregated-tree-node-drilldown.component.html',
  styleUrl: './aggregated-tree-node-drilldown.component.scss',
  host: {
    class: 'node-details-drilldown',
  },
  encapsulation: ViewEncapsulation.None,
  standalone: false,
  providers: [
    {
      provide: NODE_DETAILS_RELATIVE_PARENT,
      useFactory: () => inject(ActivatedRoute).parent!.parent!,
    },
    AltExecutionNodesHelperService,
    AltExecutionDialogsService,
  ],
})
export class AggregatedTreeNodeDrilldownComponent {
  private _router = inject(Router);
  private _activatedRoute = inject(ActivatedRoute);
  private _altExecutionNodesHelper = inject(AltExecutionNodesHelperService);
  private _dialogsService = inject(AltExecutionDialogsService);
  private _nodeDetailsRelativeParent =
    inject(NODE_DETAILS_RELATIVE_PARENT, { optional: true }) ?? this._activatedRoute.parent!.parent!;

  protected readonly stackItems = signal<StackItem[]>([{ type: StackItemType.ROOT, id: 'root' }]);

  private readonly data$ = this._activatedRoute.data.pipe(map((data) => data as DrilldownData));

  private readonly reportNodeSubscription = this.data$
    .pipe(
      filter((data) => !!data.reportNodeId),
      map((data) => data.reportNodeId),
      switchMap((reportNodeId) => this._altExecutionNodesHelper.getReportNode(reportNodeId)),
      filter((data) => !!data),
      map((data) => ({ data, id: data.id, type: StackItemType.REPORT_NODE }) as StackItem),
      takeUntilDestroyed(),
    )
    .subscribe((item) => {
      this.stackItems.update((value) => [...value, item]);
    });

  private readonly aggregatedNodeSubscription = this.data$
    .pipe(
      filter((data) => !!data.aggregatedNodeId),
      switchMap((data) => {
        return this._altExecutionNodesHelper.getAggregatedNode(data.aggregatedNodeId).pipe(
          map((node) => {
            if (!node) {
              return undefined;
            }
            const { resolvedPartialPath, searchStatus, searchStatusCount, aggregatedNodeId: id } = data;
            return {
              id,
              type: StackItemType.AGGREGATED_REPORT_NODE,
              data: node,
              resolvedPartialPath,
              searchStatus,
              searchStatusCount,
            } as StackItem;
          }),
        );
      }),
      filter((item) => !!item),
      takeUntilDestroyed(),
    )
    .subscribe((item) => {
      this.stackItems.update((value) => [...value, item]);
    });

  protected removeItem(id: string): void {
    const items = untracked(() => this.stackItems());
    // By closing of the first item, close entire view
    if (items[0].id === id) {
      this._router.navigate([{ outlets: { nodeDetails: null } }], {
        relativeTo: this._nodeDetailsRelativeParent,
        queryParamsHandling: 'merge',
      });
      return;
    }
    this.stackItems.update((value) => {
      const index = value.findIndex((item) => item.id === id);
      return value.splice(0, index);
    });
  }

  protected handleOpenIteration(
    node: AggregatedTreeNode,
    parentId: string,
    params: PartialOpenIterationsParams = {},
  ): void {
    this.removeAllAfterItem(parentId);
    queueMicrotask(() => {
      this._dialogsService.openIterations(node, params);
    });
  }

  protected handleOpenDetails(node: ReportNode, parentId: string): void {
    this.removeAllAfterItem(parentId);
    queueMicrotask(() => {
      this._dialogsService.openIterationDetails(node);
    });
  }

  protected readonly StackItemType = StackItemType;

  private removeAllAfterItem(id: string): void {
    const items = untracked(() => this.stackItems());
    if (items[items.length - 1].id === id) {
      return;
    }
    const index = items.findIndex((item) => item.id === id);
    if (index < 0) {
      return;
    }
    const nextItemId = items[index + 1].id;
    this.removeItem(nextItemId);
  }
}
