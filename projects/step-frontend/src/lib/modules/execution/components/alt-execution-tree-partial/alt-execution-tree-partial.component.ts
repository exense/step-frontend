import {
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnDestroy,
  OnInit,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { AggregatedReportViewRequest, AugmentedExecutionsService, ReportNode } from '@exense/step-core';
import { catchError, combineLatest, finalize, map, of, switchMap } from 'rxjs';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { AggregatedReportViewTreeStateService } from '../../services/aggregated-report-view-tree-state.service';
import { AltExecutionTreeComponent } from '../alt-execution-tree/alt-execution-tree.component';
import { AggregatedReportViewTreeNodeUtilsService } from '../../services/aggregated-report-view-tree-node-utils.service';
import { AggregatedTreeNode } from '../../shared/aggregated-tree-node';
import { AltExecutionDialogsService } from '../../services/alt-execution-dialogs.service';

@Component({
  selector: 'step-alt-execution-tree-partial',
  templateUrl: './alt-execution-tree-partial.component.html',
  styleUrl: './alt-execution-tree-partial.component.scss',
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.no-padding]': 'noPadding()',
  },
})
export class AltExecutionTreePartialComponent implements OnInit, OnDestroy {
  private _executionState = inject(AltExecutionStateService);
  private _destroyRef = inject(DestroyRef);
  private _executionsApi = inject(AugmentedExecutionsService);
  private _treeState = inject(AggregatedReportViewTreeStateService);
  private _treeUtils = inject(AggregatedReportViewTreeNodeUtilsService);
  private _executionDialogs = inject(AltExecutionDialogsService);

  private isRunningExecution = toSignal(
    this._executionState.execution$.pipe(map((execution) => execution.status === 'RUNNING')),
    { initialValue: false },
  );

  private tree = viewChild('tree', { read: AltExecutionTreeComponent });

  readonly node = input.required<ReportNode>();
  readonly noPadding = input(false);
  readonly autoFocusNode = input(true);
  readonly showDetailsButton = input(false);

  private isFirstLoad = signal(true);
  private loadInProgress = signal(false);
  protected showSpinner = computed(() => {
    const isFirstLoad = this.isFirstLoad();
    const isRunningExecution = this.isRunningExecution();
    const loadInProgress = this.loadInProgress();
    return (isFirstLoad || !isRunningExecution) && loadInProgress;
  });

  private reportNode$ = toObservable(this.node);

  ngOnInit(): void {
    this.setupTree();
  }

  ngOnDestroy(): void {
    this._treeUtils.cleanupImportantIds();
  }

  protected openDetails(treeNode: AggregatedTreeNode): void {
    this._executionDialogs.openIterations(treeNode, {});
  }

  private setupTree(): void {
    combineLatest([this._executionState.executionId$, this._executionState.timeRange$, this.reportNode$])
      .pipe(
        switchMap(([executionId, range, reportNode]) => {
          this.loadInProgress.set(true);
          const request: AggregatedReportViewRequest = { range, selectedReportNodeId: reportNode.id };
          return this._executionsApi.getAggregatedReportView(executionId, request).pipe(
            map((response) => {
              if (!response?.aggregatedReportView) {
                return undefined;
              }

              return {
                ...response,
                reportNode,
              };
            }),
            catchError(() => of(undefined)),
            finalize(() => {
              this.isFirstLoad.set(false);
              this.loadInProgress.set(false);
            }),
          );
        }),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe((result) => {
        if (!result) {
          return;
        }
        const { aggregatedReportView, resolvedPartialPath, reportNode } = result;

        this._treeState.init(aggregatedReportView!, { resolvedPartialPath });

        const treeNode = this.findTreeNode(reportNode);

        if (treeNode?.id) {
          this._treeUtils.markIdAsImportant(treeNode.id);
          this._treeState.selectNode(treeNode);
          if (this.autoFocusNode()) {
            this.tree()?.focusNode?.(treeNode.id);
          }
        }
      });
  }

  private findTreeNode(reportNode: ReportNode): AggregatedTreeNode | undefined {
    const nodes = this._treeState.findNodesByArtefactId(reportNode.artefactID);

    const node = nodes.length === 1 ? nodes[0] : nodes.find((item) => item.artefactHash === reportNode.artefactHash);

    return node;
  }
}
