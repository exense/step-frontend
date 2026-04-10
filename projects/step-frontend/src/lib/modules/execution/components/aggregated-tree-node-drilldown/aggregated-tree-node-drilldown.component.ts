import { Component, ElementRef, inject, OnDestroy, OnInit, signal, untracked, ViewEncapsulation } from '@angular/core';
import { AggregatedTreeNode } from '../../shared/aggregated-tree-node';
import { filter, map, switchMap } from 'rxjs';
import { ReportNode } from '@exense/step-core';
import { Status } from '../../../_common/shared/status.enum';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { AltExecutionNodesHelperService } from '../../services/alt-execution-nodes-helper.service';
import { AltExecutionDialogsService, PartialOpenIterationsParams } from '../../services/alt-execution-dialogs.service';
import { NODE_DETAILS_RELATIVE_PARENT } from '../../services/node-details-relative-parent.token';
import { VIEW_MODE, ViewMode } from '../../shared/view-mode';
import { DrilldownRootType } from '../../shared/drilldown-root-type';

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
      nodeId: string;
      rootType: DrilldownRootType;
      type: StackItemType.ROOT;
    }
  | {
      id: string;
      nodeId: string;
      type: StackItemType.REPORT_NODE;
      data: ReportNode;
    }
  | {
      id: string;
      nodeId: string;
      type: StackItemType.AGGREGATED_REPORT_NODE;
      data: AggregatedTreeNode;
      resolvedPartialPath?: string;
      searchStatus?: Status;
      searchStatusCount?: number;
    };

const IS_DRILLDOWN_OPENED = 'is-drilldown-opened';

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
    {
      provide: VIEW_MODE,
      useValue: ViewMode.VIEW,
    },
    AltExecutionNodesHelperService,
    AltExecutionDialogsService,
  ],
})
export class AggregatedTreeNodeDrilldownComponent implements OnInit, OnDestroy {
  private _el = inject<ElementRef<HTMLElement>>(ElementRef);
  private _router = inject(Router);
  private _activatedRoute = inject(ActivatedRoute);
  private _altExecutionNodesHelper = inject(AltExecutionNodesHelperService);
  private _dialogsService = inject(AltExecutionDialogsService);
  private _nodeDetailsRelativeParent =
    inject(NODE_DETAILS_RELATIVE_PARENT, { optional: true }) ?? this._activatedRoute.parent!.parent!;

  protected readonly stackItems = signal<StackItem[]>([]);
  protected readonly StackItemType = StackItemType;

  private get stackItemsUntracked(): StackItem[] {
    return untracked(() => this.stackItems());
  }

  private get currentLength(): number {
    return this.stackItemsUntracked.length;
  }

  private get executionProgressElement(): HTMLElement | null {
    return this._el.nativeElement.closest('step-alt-execution-progress') as HTMLElement | null;
  }

  private readonly data$ = this._activatedRoute.data.pipe(map((data) => data as DrilldownData));

  private readonly reportNodeSubscription = this.data$
    .pipe(
      filter((data) => !!data.reportNodeId),
      map((data) => data.reportNodeId),
      switchMap((reportNodeId) => this._altExecutionNodesHelper.getReportNode(reportNodeId)),
      filter((data) => !!data),
      map(
        (data) =>
          ({
            data,
            id: `${data.id}_${this.currentLength}`,
            nodeId: data.id,
            type: StackItemType.REPORT_NODE,
          }) as StackItem,
      ),
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
            const { resolvedPartialPath, searchStatus, searchStatusCount, aggregatedNodeId: nodeId } = data;
            return {
              id: `${nodeId}_${this.currentLength}`,
              nodeId,
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

  ngOnInit(): void {
    this.initializeRootElement();
    this.executionProgressElement?.classList?.add?.(IS_DRILLDOWN_OPENED);
  }

  ngOnDestroy(): void {
    this.executionProgressElement?.classList?.remove?.(IS_DRILLDOWN_OPENED);
  }

  protected removeItem(id: string): void {
    const items = this.stackItemsUntracked;
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
    parentStackItemId: string,
    params: PartialOpenIterationsParams = {},
  ): void {
    const singleReportNode = this._dialogsService.getSingleReportNode(node);
    if (
      (singleReportNode && !this.isPossibleToInsertItem(singleReportNode.id!, parentStackItemId)) ||
      !this.isPossibleToInsertItem(node.id!, parentStackItemId)
    ) {
      return;
    }
    this.removeAllAfterItem(parentStackItemId);
    queueMicrotask(() => {
      this._dialogsService.openIterations(node, params);
    });
  }

  protected handleOpenDetails(node: ReportNode, parentStackItemId: string): void {
    if (!this.isPossibleToInsertItem(node.id!, parentStackItemId)) {
      return;
    }
    this.removeAllAfterItem(parentStackItemId);
    queueMicrotask(() => {
      this._dialogsService.openIterationDetails(node);
    });
  }

  private isPossibleToInsertItem(nodeId: string, parentStackItemId: string): boolean {
    // Prevents to open two same items twice one after another
    let itemsToCheck = [...this.stackItemsUntracked];
    const parentIndex = itemsToCheck.findIndex((item) => item.id === parentStackItemId);
    if (parentIndex < 0) {
      return true;
    }
    itemsToCheck = itemsToCheck.splice(0, parentIndex + 1);
    if (itemsToCheck[itemsToCheck.length - 1].nodeId === nodeId) {
      return false;
    }
    return true;
  }

  private removeAllAfterItem(id: string): void {
    const items = this.stackItemsUntracked;
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

  private initializeRootElement(): void {
    let rootType = this._activatedRoute.snapshot.data?.['drilldownRootType'] as DrilldownRootType | undefined;
    rootType = rootType ?? DrilldownRootType.TREE;
    this.stackItems.update((items) => {
      if (items[0]?.type === StackItemType.ROOT) {
        items = [{ ...items[0], rootType }, ...items.slice(1)];
      } else {
        items = [{ type: StackItemType.ROOT, id: 'root', nodeId: 'root', rootType }, ...items];
      }
      return items;
    });
  }

  protected readonly DrilldownRootType = DrilldownRootType;
}
