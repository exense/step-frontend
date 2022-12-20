import {
  Component,
  forwardRef,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import {
  AbstractArtefact,
  AJS_MODULE,
  ReportNode,
  TreeAction,
  TreeActionsService,
  TreeNode,
  TreeStateService,
} from '@exense/step-core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  EXECUTION_TREE_PAGE_LIMIT,
  EXECUTION_TREE_PAGING,
  ExecutionTreePaging,
} from '../../services/execution-tree-paging';
import { ReportTreeNodeUtilsService } from '../../services/report-tree-node-utils.service';
import { ExecutionTreeAction } from '../../shared/execution-tree-action.enum';
import { ReportTreeNode } from '../../shared/report-tree-node';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'step-execution-tree',
  templateUrl: './execution-tree.component.html',
  styleUrls: ['./execution-tree.component.scss'],
  providers: [
    {
      provide: TreeActionsService,
      useExisting: forwardRef(() => ExecutionTreeComponent),
    },
  ],
  encapsulation: ViewEncapsulation.None,
})
export class ExecutionTreeComponent implements OnChanges, TreeActionsService, OnDestroy {
  readonly selectedNode$: Observable<ReportTreeNode | undefined> = this._treeState.selectedNode$;

  @Input() nodeId?: string;
  @Input() handle: any; // temporary solution, while the whole page is working in hybrid mode

  constructor(
    @Inject(EXECUTION_TREE_PAGING) private _paging: ExecutionTreePaging,
    private _treeState: TreeStateService<ReportNode, ReportTreeNode>,
    private _treeUtils: ReportTreeNodeUtilsService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    const cNodeId = changes['nodeId'];
    if (cNodeId?.previousValue !== cNodeId?.currentValue || cNodeId?.firstChange) {
      this.loadTree(cNodeId!.currentValue);
    }

    const cHandle = changes['handle'];
    if (cHandle?.previousValue !== cHandle?.currentValue || cHandle?.firstChange) {
      this.destroyHandle(cHandle.previousValue);
      this.setupHandle(cHandle.currentValue);
    }
  }

  ngOnDestroy(): void {
    this.destroyHandle(this.handle);
  }

  handleContextAction(actionId: string, node?: AbstractArtefact): void {
    const nodeId = node?.id!;
    switch (actionId) {
      case ExecutionTreeAction.loadPreviousNodes:
        this.pageBefore(nodeId);
        break;
      case ExecutionTreeAction.loadNextNodes:
        this.pageNext(nodeId);
        break;
      default:
        return;
    }
    this._treeState.reloadChildrenForNode(nodeId);
  }

  private loadTree(nodeId: string): void {
    this._treeUtils.loadNodes(nodeId).subscribe((nodes) => {
      if (!!nodes[0]) {
        this._treeState.init(nodes[0], [], false);
      }
    });
  }

  getActionsForNode(node: TreeNode): Observable<TreeAction[]> {
    const nodeId = node.id;
    const canPrevious = (this._paging[nodeId]?.skip || 0) > 0;
    const canNext = (node?.children || []).length >= EXECUTION_TREE_PAGE_LIMIT;
    return of([
      {
        id: ExecutionTreeAction.loadPreviousNodes,
        label: this.getPreviousLabel(node),
        disabled: !canPrevious,
      },
      {
        id: ExecutionTreeAction.loadNextNodes,
        label: this.getNextLabel(node),
        disabled: !canNext,
      },
    ]);
  }

  hasActionsForNode(node: TreeNode): boolean {
    return true;
  }

  private pageBefore(nodeId: string): void {
    if (this._paging[nodeId]) {
      let skip = this._paging[nodeId].skip - EXECUTION_TREE_PAGE_LIMIT;
      skip = skip > 0 ? skip : 0;
      this._paging[nodeId] = { skip };
    }
  }

  private pageNext(nodeId: string): void {
    let skip = EXECUTION_TREE_PAGE_LIMIT;
    if (this._paging[nodeId]) {
      skip = this._paging[nodeId].skip + EXECUTION_TREE_PAGE_LIMIT;
    }
    this._paging[nodeId] = { skip };
  }

  private getPreviousLabel(node: TreeNode): string {
    const nodeId = node.id;
    const currentSkip = this._paging[nodeId]?.skip || 0;
    const newSkip = currentSkip >= EXECUTION_TREE_PAGE_LIMIT ? currentSkip - EXECUTION_TREE_PAGE_LIMIT : 0;
    return 'Previous Nodes' + (currentSkip > 0 ? ` (${newSkip}..${currentSkip})` : '');
  }

  private getNextLabel(node: TreeNode): string {
    const nodeId = node.id;
    const currentSkip = this._paging[nodeId]?.skip || 0;
    const childrenLength = (node.children || []).length;
    return (
      'Next Nodes' +
      (childrenLength >= EXECUTION_TREE_PAGE_LIMIT
        ? ` (${currentSkip + EXECUTION_TREE_PAGE_LIMIT}..${currentSkip + EXECUTION_TREE_PAGE_LIMIT * 2})`
        : '')
    );
  }

  private setupHandle(handle: any): void {
    if (!handle) {
      return;
    }
    handle.expandPath = (nodes: ReportNode[]) => {
      const path = nodes.map((node) => node.id!);
      this._treeState.expandNode(path).subscribe();
    };
  }

  private destroyHandle(handle: any): void {
    if (!handle) {
      return;
    }
    handle.expandPath = undefined;
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepExecutionTree', downgradeComponent({ component: ExecutionTreeComponent }));
