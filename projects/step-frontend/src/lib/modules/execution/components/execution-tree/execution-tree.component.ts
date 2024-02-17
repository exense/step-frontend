import { Component, forwardRef, Inject, ViewEncapsulation } from '@angular/core';
import {
  AbstractArtefact,
  ReportNode,
  TreeAction,
  TreeActionsService,
  TreeNode,
  TreeStateService,
} from '@exense/step-core';
import {
  EXECUTION_TREE_PAGING,
  ExecutionTreePaging,
  ExecutionTreePagingSetting,
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
    ExecutionTreePaging,
    {
      provide: TreeActionsService,
      useExisting: forwardRef(() => ExecutionTreeComponent),
    },
  ],
  encapsulation: ViewEncapsulation.None,
})
export class ExecutionTreeComponent implements TreeActionsService {
  readonly selectedNode$: Observable<ReportTreeNode | undefined> = this._treeState.selectedNode$;

  constructor(
    @Inject(EXECUTION_TREE_PAGING) private _paging: ExecutionTreePagingSetting,
    private _executionTreePaging: ExecutionTreePaging,
    private _treeState: TreeStateService<ReportNode, ReportTreeNode>
  ) {}

  handleContextAction(actionId: string, node?: AbstractArtefact): void {
    const nodeId = node?.id!;
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

  getActionsForNode(node: TreeNode): Observable<TreeAction[]> {
    const nodeId = node.id;
    const canPrevious = (this._paging[nodeId]?.skip || 0) > 0;
    const canNext = (node?.children || []).length >= this._executionTreePaging.getExecutionTreePaging();
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
    return true;
  }

  private pageBefore(nodeId: string): void {
    if (this._paging[nodeId]) {
      let skip = this._paging[nodeId].skip - this._executionTreePaging.getExecutionTreePaging();
      skip = skip > 0 ? skip : 0;
      this._paging[nodeId] = { skip };
    }
  }

  private pageNext(nodeId: string): void {
    let skip = this._executionTreePaging.getExecutionTreePaging();
    if (this._paging[nodeId]) {
      skip = this._paging[nodeId].skip + this._executionTreePaging.getExecutionTreePaging();
    }
    this._paging[nodeId] = { skip };
  }

  private getPreviousLabel(node: TreeNode): string {
    const nodeId = node.id;
    const currentSkip = this._paging[nodeId]?.skip || 0;
    const newSkip =
      currentSkip >= this._executionTreePaging.getExecutionTreePaging()
        ? currentSkip - this._executionTreePaging.getExecutionTreePaging()
        : 0;
    return 'Previous Nodes' + (currentSkip > 0 ? ` (${newSkip}..${currentSkip})` : '');
  }

  private getNextLabel(node: TreeNode): string {
    const nodeId = node.id;
    const currentSkip = this._paging[nodeId]?.skip || 0;
    const childrenLength = (node.children || []).length;
    return (
      'Next Nodes' +
      (childrenLength >= this._executionTreePaging.getExecutionTreePaging()
        ? ` (${currentSkip + this._executionTreePaging.getExecutionTreePaging()}..${
            currentSkip + this._executionTreePaging.getExecutionTreePaging() * 2
          })`
        : '')
    );
  }
}
