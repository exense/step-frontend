import { Component, ElementRef, forwardRef, inject, ViewEncapsulation } from '@angular/core';
import { TreeAction, TreeActionsService, TreeNode, TreeStateService } from '@exense/step-core';
import { filter, map, Observable, of, switchMap, tap, timer } from 'rxjs';
import { AggregatedTreeNode } from '../../shared/aggregated-tree-node';

enum TreeNodeAction {
  EXPAND_CHILDREN = 'expand_children',
  COLLAPSE_CHILDREN = 'collapse_children',
}

@Component({
  selector: 'step-alt-execution-tree',
  templateUrl: './alt-execution-tree.component.html',
  styleUrl: './alt-execution-tree.component.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: TreeActionsService,
      useExisting: forwardRef(() => AltExecutionTreeComponent),
    },
  ],
})
export class AltExecutionTreeComponent implements TreeActionsService {
  private _el = inject<ElementRef<HTMLElement>>(ElementRef);
  private _treeSate = inject(TreeStateService);

  getActionsForNode(node: TreeNode, multipleNodes?: boolean): Observable<TreeAction[]> {
    return of([
      { id: TreeNodeAction.EXPAND_CHILDREN, label: 'Expand all children' },
      { id: TreeNodeAction.COLLAPSE_CHILDREN, label: 'Collapse all children' },
    ]);
  }

  hasActionsForNode(node: TreeNode): boolean {
    if (!node.children?.length) {
      return false;
    }
    return node.children.some((child) => !!child.children?.length);
  }

  focusNode(nodeId: string): void {
    this._treeSate
      .expandNode(nodeId)
      .pipe(
        map((isExpanded) => (isExpanded ? nodeId : undefined)),
        filter((isExpanded) => !!isExpanded),
        tap((nodeId) => this._treeSate.selectNode(nodeId)),
        switchMap((nodeId) => timer(500).pipe(map(() => nodeId))),
      )
      .subscribe((nodeId) => {
        const nodeElement = this._el.nativeElement.querySelector<HTMLElement>(`[data-node-id="${nodeId}"]`);
        nodeElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
  }

  protected proceedAction(actionId: string, node: TreeNode, multiple?: boolean): void {
    if (multiple) {
      return;
    }
    switch (actionId) {
      case TreeNodeAction.EXPAND_CHILDREN:
        this._treeSate.expandSubTree(node.id);
        break;
      case TreeNodeAction.COLLAPSE_CHILDREN:
        this._treeSate.collapseSubTree(node.id);
        break;
      default:
        break;
    }
  }
}
