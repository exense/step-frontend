import { Component, forwardRef, inject, ViewEncapsulation } from '@angular/core';
import {
  AbstractArtefact,
  ReportNode,
  TreeAction,
  TreeActionsService,
  TreeNode,
  TreeStateService,
} from '@exense/step-core';
import {
  EXECUTION_TREE_PAGING_SETTINGS,
  ExecutionTreePagingService,
} from '../../services/execution-tree-paging.service';
import { ExecutionTreeAction } from '../../shared/execution-tree-action.enum';
import { ReportTreeNode } from '../../shared/report-tree-node';
import { Observable, of } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'step-execution-tree',
  templateUrl: './execution-tree.component.html',
  styleUrl: './execution-tree.component.scss',
  providers: [
    ExecutionTreePagingService,
    {
      provide: TreeActionsService,
      useExisting: forwardRef(() => ExecutionTreeComponent),
    },
  ],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class ExecutionTreeComponent implements TreeActionsService {
  private _paging = inject(EXECUTION_TREE_PAGING_SETTINGS);
  private _executionTreePagingService = inject(ExecutionTreePagingService);
  private _treeState = inject<TreeStateService<ReportNode, ReportTreeNode>>(TreeStateService);
  readonly selectedNode$: Observable<ReportTreeNode | undefined> = toObservable(this._treeState.selectedNode);

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
    const canNext = (node?.children || []).length >= this._executionTreePagingService.getExecutionTreePaging();
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

  private getNextLabel(node: TreeNode): string {
    const nodeId = node.id;
    const currentSkip = this._paging[nodeId]?.skip || 0;
    const childrenLength = (node.children || []).length;
    return (
      'Next Nodes' +
      (childrenLength >= this._executionTreePagingService.getExecutionTreePaging()
        ? ` (${currentSkip + this._executionTreePagingService.getExecutionTreePaging()}..${
            currentSkip + this._executionTreePagingService.getExecutionTreePaging() * 2
          })`
        : '')
    );
  }
}
