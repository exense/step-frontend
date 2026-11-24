import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  OnDestroy,
  OnInit,
  output,
  signal,
  untracked,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { AggregatedReportViewRequest, AugmentedExecutionsService, ReportNode } from '@exense/step-core';
import { catchError, combineLatest, filter, finalize, map, of, switchMap } from 'rxjs';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { AggregatedReportViewTreeStateService } from '../../services/aggregated-report-view-tree-state.service';
import { AltExecutionTreeComponent } from '../alt-execution-tree/alt-execution-tree.component';
import { AggregatedTreeNode } from '../../shared/aggregated-tree-node';
import { AggregatedReportViewTreeSearchFacadeService } from '../../services/aggregated-report-view-tree-search-facade.service';
import { Router } from '@angular/router';
import { Status } from '../../../_common/shared/status.enum';
import { OpenIterationsEvent } from '../../services/alt-execution-dialogs.service';

@Component({
  selector: 'step-alt-execution-tree-partial',
  templateUrl: './alt-execution-tree-partial.component.html',
  styleUrl: './alt-execution-tree-partial.component.scss',
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.no-padding]': 'noPadding()',
    '[attr.aria-busy]': 'showLoading()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AltExecutionTreePartialComponent implements OnInit, OnDestroy {
  private _executionState = inject(AltExecutionStateService);
  private _destroyRef = inject(DestroyRef);
  private _executionsApi = inject(AugmentedExecutionsService);
  private _treeState = inject(AggregatedReportViewTreeStateService);
  protected readonly _treeSearch = inject(AggregatedReportViewTreeSearchFacadeService);
  private _router = inject(Router);

  readonly openIterations = output<OpenIterationsEvent>();

  private readonly isRunningExecution = toSignal(
    this._executionState.execution$.pipe(map((execution) => execution.status === 'RUNNING')),
    { initialValue: false },
  );

  private readonly tree = viewChild('tree', { read: AltExecutionTreeComponent });

  readonly node = input.required<ReportNode>();
  readonly noPadding = input(false);
  readonly autoFocusNode = input(true);
  readonly showDetailsButton = input(false);
  readonly details = input<readonly string[] | undefined>(undefined);

  private lastRequestedReportNodeId?: string;
  private readonly loadedReportNodeId = signal<string | undefined>(undefined);
  private readonly loadInProgress = signal(true);
  protected readonly loadFailed = signal(false);
  protected readonly showLoading = computed(() => {
    const reportNode = this.node();
    const loadedReportNodeId = this.loadedReportNodeId();
    const isRunningExecution = this.isRunningExecution();
    const loadInProgress = this.loadInProgress();
    const hasTree = !!this._treeState.flatTree().length;
    return (reportNode.id !== loadedReportNodeId || !hasTree || !isRunningExecution) && loadInProgress;
  });

  protected readonly showEmptyState = computed(() => {
    const loadInProgress = this.loadInProgress();
    const tree = this._treeState.flatTree();
    return !loadInProgress && !tree.length;
  });

  private readonly reportNode$ = toObservable(this.node);

  private effectFocusNode = effect(() => {
    const foundItems = this._treeSearch.foundItems();
    const pageIndex = this._treeSearch.pageIndex();
    if (!foundItems) {
      return;
    }
    untracked(() => {
      const itemId = this._treeState.pickSearchResultItemByIndex(pageIndex);
      if (itemId) {
        this.tree()?.focusNode(itemId);
      }
    });
  });

  ngOnInit(): void {
    this.setupTree();
  }

  ngOnDestroy(): void {
    this._treeState._treeNodeUtils.cleanupImportantIds();
  }

  focusAndSearch(query: string): void {
    this._treeSearch.searchCtrl.setValue(query ?? '');
  }

  protected openDetails(node: AggregatedTreeNode): void {
    this.openIterations.emit({ node, restParams: {} });
  }

  private setupTree(): void {
    combineLatest([this._executionState.executionId$, this._executionState.timeRange$, this.reportNode$])
      .pipe(
        filter(([_, range, reportNode]) => {
          if (!range) {
            return false;
          }
          if (this.lastRequestedReportNodeId !== reportNode.id || range.isManualChange) {
            return true;
          }
          if (this.loadInProgress()) {
            return false;
          }
          return this.loadedReportNodeId() !== reportNode.id || reportNode.status === Status.RUNNING;
        }),
        switchMap(([executionId, range, reportNode]) => {
          this.lastRequestedReportNodeId = reportNode.id;
          this.loadFailed.set(false);
          this.loadInProgress.set(true);
          const request: AggregatedReportViewRequest = { range, selectedReportNodeId: reportNode.id };
          return this._executionsApi.getAggregatedReportView(executionId, request).pipe(
            map((response) => ({
              aggregatedReportView: response?.aggregatedReportView,
              partialTreeRootNodeId: response?.partialTreeRootNodeId,
              reportNode,
            })),
            catchError(() => {
              this.loadFailed.set(true);
              return of({
                aggregatedReportView: undefined,
                partialTreeRootNodeId: undefined,
                reportNode,
              });
            }),
            finalize(() => {
              this.loadInProgress.set(false);
            }),
          );
        }),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe((result) => {
        this.loadedReportNodeId.set(result.reportNode.id);
        if (!result.aggregatedReportView?.artefact?.id) {
          this._treeState._treeNodeUtils.cleanupImportantIds();
          this._treeState.init(undefined);
          return;
        }
        const { aggregatedReportView, partialTreeRootNodeId, reportNode } = result;

        this._treeState.init(aggregatedReportView, { partialTreeRootNodeId });

        const treeNode = this.findTreeNode(reportNode);

        if (treeNode?.id) {
          this._treeState._treeNodeUtils.markIdAsImportant(treeNode.id);
          this._treeState.selectNode(treeNode);
          if (this.autoFocusNode()) {
            this.tree()?.focusNode?.(treeNode.id);
          }
        }

        const url = this._router.parseUrl(this._router.url);
        const searchFor = url.queryParams['searchFor'];
        if (searchFor) {
          queueMicrotask(() => this._treeSearch.searchCtrl.setValue(searchFor));
        }
      });
  }

  private findTreeNode(reportNode: ReportNode): AggregatedTreeNode | undefined {
    const nodes = this._treeState.findNodesByArtefactId(reportNode.artefactID);

    const node = nodes.length === 1 ? nodes[0] : nodes.find((item) => item.artefactHash === reportNode.artefactHash);

    return node;
  }
}
