import {
  Component,
  computed,
  contentChild,
  forwardRef,
  inject,
  input,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { TreeAction, TreeActionsService, TreeComponent, TreeNode, TreeStateService } from '@exense/step-core';
import { filter, first, map, Observable, of, switchMap, tap, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { DashboardUrlParamsService } from '../../../timeseries/modules/_common/injectables/dashboard-url-params.service';
import { AltExecutionTreeNodeAddonDirective } from '../../directives/alt-execution-tree-node-addon.directive';

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
  private _treeSate = inject(TreeStateService);

  protected readonly _state = inject(AltExecutionStateService);
  private _urlParamsService = inject(DashboardUrlParamsService);
  private tree = viewChild('tree', { read: TreeComponent });

  updateUrlParams = this._state.timeRangeSelection$.pipe(takeUntilDestroyed(), first()).subscribe((range) => {
    this._urlParamsService.patchUrlParams(range, undefined, true);
  });

  readonly showSpinnerForEmptyTree = input(false);

  protected readonly showSpinner = computed(() => {
    const showSpinnerForEmptyTree = this.showSpinnerForEmptyTree();
    const isInitialized = this._treeSate.isInitialized();
    return showSpinnerForEmptyTree && !isInitialized;
  });

  protected readonly treeNodeAddon = contentChild(AltExecutionTreeNodeAddonDirective);

  getActionsForNode(node: TreeNode, multipleNodes?: boolean): Observable<TreeAction[]> {
    const disabled = !node.children?.length;
    return of([
      { id: TreeNodeAction.EXPAND_CHILDREN, label: 'Expand all children', disabled },
      { id: TreeNodeAction.COLLAPSE_CHILDREN, label: 'Collapse all children', disabled },
    ]);
  }

  hasActionsForNode(node: TreeNode): boolean {
    return true;
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
        this.tree()?.scrollToNode?.(nodeId);
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
