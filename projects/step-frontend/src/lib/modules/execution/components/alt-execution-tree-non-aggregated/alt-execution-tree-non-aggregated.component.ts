import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  inject,
  input,
  output,
  ViewEncapsulation,
} from '@angular/core';
import {
  ReportNode,
  TreeAction,
  TreeActionsService,
  TreeComponent,
  TreeNode,
  TreeNodeNameTemplateDirective,
  StepIconsModule,
  StepMaterialModule,
} from '@exense/step-core';
import { Observable, of } from 'rxjs';
import {
  EXECUTION_TREE_PAGING_SETTINGS,
  ExecutionTreePagingService,
} from '../../services/execution-tree-paging.service';
import { ExecutionTreeAction } from '../../shared/execution-tree-action.enum';
import { REPORT_NODE_TREE_WIDGET_STATE } from '../../services/aggregated-report-view-tree-state.service';
import { ReportTreeNode } from '../../shared/report-tree-node';

@Component({
  selector: 'step-alt-execution-tree-non-aggregated',
  imports: [TreeComponent, TreeNodeNameTemplateDirective, StepIconsModule, StepMaterialModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: TreeActionsService,
      useExisting: forwardRef(() => AltExecutionTreeNonAggregatedComponent),
    },
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './alt-execution-tree-non-aggregated.component.html',
  styleUrl: './alt-execution-tree-non-aggregated.component.scss',
})
export class AltExecutionTreeNonAggregatedComponent implements TreeActionsService {
  private _paging = inject(EXECUTION_TREE_PAGING_SETTINGS);
  private _executionTreePagingService = inject(ExecutionTreePagingService);
  private _treeState = inject(REPORT_NODE_TREE_WIDGET_STATE);

  readonly showSpinnerWhileTreeInitialize = input(false);
  readonly showSkeletonWhileLoading = input(false);
  readonly nodeClick = output<ReportNode>();

  protected readonly omittedChildrenByNode = computed<Record<string, boolean>>(() => {
    const nodes = this._treeState.flatTree();
    return Object.fromEntries(
      nodes.map(({ id }) => {
        const page = this._treeState.findNodeById(id)?.childrenPage;
        return [id, !!page && (page.hasNext || page.skip > 0)];
      }),
    );
  });

  protected readonly showSkeleton = computed(() => {
    const showSkeletonForEmptyTree = this.showSpinnerWhileTreeInitialize();
    const showSkeletonWhileLoading = this.showSkeletonWhileLoading();
    const isInitialized = this._treeState.isInitialized();
    return showSkeletonWhileLoading || (showSkeletonForEmptyTree && !isInitialized);
  });

  protected handleContextAction(actionId: string, node?: TreeNode): void {
    const nodeId = node?.id!;
    if (!nodeId) {
      return;
    }
    switch (actionId) {
      case ExecutionTreeAction.LOAD_PREVIOUS_NODES:
        this.pageBefore(nodeId);
        break;
      case ExecutionTreeAction.LOAD_NEXT_NODES:
        this.pageNext(nodeId);
        break;
      default:
        return;
    }
    this._treeState.reloadChildrenForNode(nodeId);
  }

  getActionsForNode(node: ReportTreeNode): Observable<TreeAction[]> {
    const canPrevious = (node.childrenPage?.skip ?? 0) > 0;
    const canNext = !!node.childrenPage?.hasNext;
    return of([
      {
        id: ExecutionTreeAction.LOAD_PREVIOUS_NODES,
        label: this.getPreviousLabel(node),
        disabled: !canPrevious,
      },
      {
        id: ExecutionTreeAction.LOAD_NEXT_NODES,
        label: this.getNextLabel(node),
        disabled: !canNext,
      },
    ]);
  }

  hasActionsForNode(node: TreeNode): boolean {
    return !node.id.includes('|');
  }

  protected handleNodeClick(node: ReportTreeNode): void {
    let nodeId = node.id;
    let result = node.originalNode;
    if (!!nodeId && nodeId.includes('|')) {
      nodeId = nodeId.split('|')[1];
      result = this._treeState.findNodeById(nodeId)?.originalNode;
    }
    if (!result) {
      return;
    }
    this.nodeClick.emit(result);
  }

  private pageBefore(nodeId: string): void {
    if (this._paging[nodeId]) {
      let skip = this._paging[nodeId].skip - this._executionTreePagingService.getExecutionTreePaging();
      skip = skip > 0 ? skip : 0;
      this._paging[nodeId] = { skip };
    }
  }

  private pageNext(nodeId: string): void {
    let skip = this._executionTreePagingService.getExecutionTreePaging();
    if (this._paging[nodeId]) {
      skip = this._paging[nodeId].skip + this._executionTreePagingService.getExecutionTreePaging();
    }
    this._paging[nodeId] = { skip };
  }

  private getPreviousLabel(node: TreeNode): string {
    const nodeId = node.id;
    const currentSkip = this._paging[nodeId]?.skip || 0;
    const newSkip =
      currentSkip >= this._executionTreePagingService.getExecutionTreePaging()
        ? currentSkip - this._executionTreePagingService.getExecutionTreePaging()
        : 0;
    return 'Previous Nodes' + (currentSkip > 0 ? ` (${newSkip}..${currentSkip})` : '');
  }

  private getNextLabel(node: ReportTreeNode): string {
    const nodeId = node.id;
    const currentSkip = this._paging[nodeId]?.skip || 0;
    const hasNext = !!node.childrenPage?.hasNext;
    return (
      'Next Nodes' +
      (hasNext
        ? ` (${currentSkip + this._executionTreePagingService.getExecutionTreePaging()}..${
            currentSkip + this._executionTreePagingService.getExecutionTreePaging() * 2
          })`
        : '')
    );
  }
}
