import {
  Component,
  computed,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  untracked,
  ViewEncapsulation,
} from '@angular/core';
import { AggregatedTreeNode } from '../../shared/aggregated-tree-node';
import { filter, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { ReportNode } from '@exense/step-core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { AltExecutionNodesHelperService } from '../../services/alt-execution-nodes-helper.service';
import { AltExecutionDialogsService, PartialOpenIterationsParams } from '../../services/alt-execution-dialogs.service';
import { NODE_DETAILS_RELATIVE_PARENT } from '../../services/node-details-relative-parent.token';
import { VIEW_MODE, ViewMode } from '../../shared/view-mode';
import { DrilldownRootType } from '../../shared/drilldown-root-type';
import {
  DrillDownAggregatedReportNodeStackItem,
  DrillDownAggregatedReportNodeStackItemConfig,
  DrillDownReportNodeStackItem,
  DrillDownReportNodeStackItemConfig,
  DrillDownRootStackItem,
  DrillDownRootStackItemConfig,
  DrillDownStackItem,
  DrillDownStackItemConfig,
  DrillDownStackItemType,
} from '../../shared/drilldown-stack-item';
import { ROOT_NODE_ID } from 'step-enterprise-frontend/plugins/step-enterprise-core/src/app/modules/azure-devops/types/root.constant';
import { v4 } from 'uuid';
import { AltExecutionDrilldownNavigationUtilsService } from '../../services/alt-execution-drilldown-navigation-utils.service';
import { AggregatedReportViewTreeStateContextService } from '../../services/aggregated-report-view-tree-state.service';

interface DrilldownData {
  drilldownState: DrillDownStackItemConfig[];
}

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
    AltExecutionDrilldownNavigationUtilsService,
    AltExecutionDialogsService,
  ],
})
export class AggregatedTreeNodeDrilldownComponent implements OnInit, OnDestroy {
  private _el = inject<ElementRef<HTMLElement>>(ElementRef);
  private _activatedRoute = inject(ActivatedRoute);
  private _altExecutionNodesHelper = inject(AltExecutionNodesHelperService);
  private _treeStateContext = inject(AggregatedReportViewTreeStateContextService);
  private _drilldownNavigationUtils = inject(AltExecutionDrilldownNavigationUtilsService);

  protected readonly stackItems = signal<DrillDownStackItem[]>([]);
  protected readonly StackItemType = DrillDownStackItemType;

  protected readonly selectedRootReportNodeId = computed(() => {
    const stackItems = this.stackItems();
    const [root, first] = stackItems;
    if (root.type !== DrillDownStackItemType.ROOT || root.rootType !== DrilldownRootType.KEYWORDS || !first) {
      return undefined;
    }
    return first.nodeId;
  });

  protected readonly selectedAggregatedNodeId = computed(() => {
    const stackItems = this.stackItems();
    const [root, first] = stackItems;
    if (root.type !== DrillDownStackItemType.ROOT || root.rootType !== DrilldownRootType.TESTCASES || !first) {
      return undefined;
    }
    return first.nodeId;
  });

  private get stackItemsUntracked(): DrillDownStackItem[] {
    return untracked(() => this.stackItems());
  }

  private get executionProgressElement(): HTMLElement | null {
    return this._el.nativeElement.closest('step-alt-execution-progress') as HTMLElement | null;
  }

  private readonly data$ = this._activatedRoute.data.pipe(map((data) => data as DrilldownData));

  private readonly updateStateSubscription = this.data$
    .pipe(
      filter((data) => !!data.drilldownState.length),
      map((data) => data.drilldownState),
      map((drillDownState) => {
        const stateToConfigure: DrillDownStackItemConfig[] = [];
        const items = this.stackItemsUntracked;
        let keepIndex: number;
        for (keepIndex = 0; keepIndex < items.length && keepIndex < stateToConfigure.length; keepIndex++) {
          if (keepIndex === 0) {
            const rootConfig = drillDownState[0] as DrillDownRootStackItemConfig;
            const rootItem = items[0] as DrillDownRootStackItem;
            if (rootConfig.rootType !== rootItem.rootType) {
              break;
            }
            continue;
          }

          if (
            drillDownState[keepIndex].type !== items[keepIndex].type &&
            drillDownState[keepIndex].nodeId !== items[keepIndex].nodeId
          ) {
            break;
          }
        }
        const stateToSetup = drillDownState.slice(keepIndex);
        return { stateToSetup, keepIndex };
      }),
      switchMap(({ stateToSetup, keepIndex }) => {
        const newItems = stateToSetup.map((config) => this.getNode(config));
        const newItemsResult$ = forkJoin(newItems);
        return newItemsResult$.pipe(
          map((resultItems) => resultItems.filter((item) => !!item)),
          map((newItems) => ({ newItems, keepIndex })),
        );
      }),
      takeUntilDestroyed(),
    )
    .subscribe(({ newItems, keepIndex }) => {
      this.stackItems.update((items) => {
        return [...items.slice(0, keepIndex), ...newItems];
      });
    });

  ngOnInit(): void {
    this.executionProgressElement?.classList?.add?.(IS_DRILLDOWN_OPENED);
  }

  ngOnDestroy(): void {
    this.executionProgressElement?.classList?.remove?.(IS_DRILLDOWN_OPENED);
  }

  protected handleCloseAll(): void {
    const items = this.stackItemsUntracked;
    this.removeItem(items[0].id);
  }

  protected removeItem(id: string, withLocationUpdate?: boolean): void {
    const items = this.stackItemsUntracked;
    // By closing of the first item, close entire view
    if (items[0].id === id) {
      this._drilldownNavigationUtils.closeDrilldown();
      return;
    }
    this.stackItems.update((value) => {
      const index = value.findIndex((item) => item.id === id);
      const result = value.splice(0, index);
      if (withLocationUpdate) {
        this._drilldownNavigationUtils.changeDrilldownLocation(result);
      }
      return result;
    });
  }

  protected handleOpenIteration(
    node: AggregatedTreeNode,
    parentStackItemId: string,
    params: PartialOpenIterationsParams = {},
  ): void {
    const singleReportNode = this._drilldownNavigationUtils.getSingleReportNode(node);
    if (
      (singleReportNode && !this.isPossibleToInsertItem(singleReportNode.id!, parentStackItemId)) ||
      !this.isPossibleToInsertItem(node.id!, parentStackItemId)
    ) {
      return;
    }

    if (singleReportNode) {
      this.handleOpenDetails(singleReportNode, parentStackItemId);
      return;
    }

    this.removeAllAfterItem(parentStackItemId);

    const newItem: DrillDownAggregatedReportNodeStackItem = {
      type: DrillDownStackItemType.AGGREGATED_REPORT_NODE,
      nodeId: node.id!,
      data: node,
      id: v4(),
      searchStatus: params.nodeStatus,
      searchStatusCount: params.nodeStatusCount,
      resolvedPartialPath: untracked(() => this._treeStateContext.getState().resolvedPartialPath()),
    };

    queueMicrotask(() => {
      this.stackItems.update((value) => {
        const result = [...value, newItem];
        this._drilldownNavigationUtils.changeDrilldownLocation(result);
        return result;
      });
    });
  }

  protected handleOpenDetails(node: ReportNode, parentStackItemId: string): void {
    if (!this.isPossibleToInsertItem(node.id!, parentStackItemId)) {
      return;
    }
    this.removeAllAfterItem(parentStackItemId);

    const newItem: DrillDownReportNodeStackItem = {
      type: DrillDownStackItemType.REPORT_NODE,
      nodeId: node.id!,
      data: node,
      id: v4(),
    };

    queueMicrotask(() => {
      this.stackItems.update((value) => {
        const result = [...value, newItem];
        this._drilldownNavigationUtils.changeDrilldownLocation(result);
        return result;
      });
    });
  }

  private isPossibleToInsertItem(nodeId: string, parentStackItemId: string): boolean {
    // Prevents to open two same items twice one after another
    let itemsToCheck = [...this.stackItemsUntracked];
    const parentIndex = itemsToCheck.findIndex((item) => item.id === parentStackItemId);
    if (parentIndex < 0) {
      return true;
    }
    if (itemsToCheck[parentIndex + 1]?.nodeId === nodeId) {
      return false;
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

  private getNode(config: DrillDownStackItemConfig): Observable<DrillDownStackItem | undefined> {
    switch (config.type) {
      case DrillDownStackItemType.ROOT:
        return this.getRootNode(config);
      case DrillDownStackItemType.REPORT_NODE:
        return this.getReportNode(config);
      case DrillDownStackItemType.AGGREGATED_REPORT_NODE:
        return this.getAggregatedReportNode(config);
      default:
        return of(undefined);
    }
  }

  private getRootNode(config: DrillDownRootStackItemConfig): Observable<DrillDownRootStackItem> {
    const result: DrillDownRootStackItem = {
      ...config,
      id: ROOT_NODE_ID,
    };
    return of(result);
  }

  private getReportNode(
    config: DrillDownReportNodeStackItemConfig,
  ): Observable<DrillDownReportNodeStackItem | undefined> {
    return this._altExecutionNodesHelper.getReportNode(config.nodeId).pipe(
      map((data) => {
        if (!data) {
          return undefined;
        }
        return {
          ...config,
          id: v4(),
          data,
        };
      }),
    );
  }

  private getAggregatedReportNode(
    config: DrillDownAggregatedReportNodeStackItemConfig,
  ): Observable<DrillDownAggregatedReportNodeStackItem | undefined> {
    return this._altExecutionNodesHelper.getAggregatedNode(config.nodeId).pipe(
      map((data) => {
        if (!data) {
          return undefined;
        }
        return {
          ...config,
          id: v4(),
          data,
        };
      }),
    );
  }

  protected readonly DrilldownRootType = DrilldownRootType;
}
