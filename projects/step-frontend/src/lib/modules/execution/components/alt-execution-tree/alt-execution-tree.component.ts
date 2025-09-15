import {
  Component,
  computed,
  contentChild,
  forwardRef,
  inject,
  input,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { TreeAction, TreeActionsService, TreeComponent, TreeNode } from '@exense/step-core';
import { filter, first, map, Observable, of, switchMap, tap, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { DashboardUrlParamsService } from '../../../timeseries/modules/_common/injectables/dashboard-url-params.service';
import { AltExecutionTreeNodeAddonDirective } from '../../directives/alt-execution-tree-node-addon.directive';
import { AggregatedReportViewTreeStateService } from '../../services/aggregated-report-view-tree-state.service';
import { AggregatedTreeNode } from '../../shared/aggregated-tree-node';
import { ERROR_STATUSES } from '../../../_common/shared/status.enum';
import { AggregatedReportViewTreeNodeUtilsService } from '../../services/aggregated-report-view-tree-node-utils.service';

enum TreeNodeAction {
  EXPAND_CHILDREN = 'expand_children',
  COLLAPSE_CHILDREN = 'collapse_children',
  FIND_ROOT_CAUSE = 'find_root_cause',
  //PREV_ROOT_CAUSE = 'previous_root_cause',
  //NEXT_ROOT_CAUSE = 'next_root_cause',
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
  standalone: false,
})
export class AltExecutionTreeComponent implements TreeActionsService {
  protected readonly _treeSate = inject(AggregatedReportViewTreeStateService);
  private _utils = inject(AggregatedReportViewTreeNodeUtilsService);

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
    const actions: TreeAction[] = [
      { id: TreeNodeAction.EXPAND_CHILDREN, label: 'Expand all children', disabled },
      { id: TreeNodeAction.COLLAPSE_CHILDREN, label: 'Collapse all children', disabled },
    ];

    const aggregatedNode = node as AggregatedTreeNode;

    const hasErrors = this._utils.nodeHasStatuses(aggregatedNode, ERROR_STATUSES);

    if (hasErrors) {
      actions.push({
        id: TreeNodeAction.FIND_ROOT_CAUSE,
        label: 'Find error cause',
      });
    }

    //const errorLeafs = this._treeSate.errorLeafs();
    //const currentLeafIndex = errorLeafs ? errorLeafs.indexOf(node.id) : -1;
    //if (!!errorLeafs?.length && currentLeafIndex >= 0) {
    //  const total = errorLeafs.length;
    //  if (total > 1) {
    //    const [prev, next] = this.findErrorLeafSiblings(node.id);
    //    actions.push(
    //      {
    //        id: TreeNodeAction.PREV_ROOT_CAUSE,
    //        label: `Navigate to previous error cause (${prev + 1} of ${total})`,
    //      },
    //      {
    //        id: TreeNodeAction.NEXT_ROOT_CAUSE,
    //        label: `Navigate to next error cause (${next + 1} of ${total})`,
    //      },
    //    );
    //  }
    //}

    return of(actions);
  }

  hasActionsForNode(node: TreeNode): boolean {
    return true;
  }

  proceedAction(actionId: string, node: TreeNode, multiple?: boolean): void {
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
      case TreeNodeAction.FIND_ROOT_CAUSE:
        this._treeSate.findErrorLeafs(node.id);
        const errorLeafs = this._treeSate.searchResult();
        if (!!errorLeafs?.length) {
          this.focusNode(errorLeafs[0]);
        }
        break;
      //case TreeNodeAction.NEXT_ROOT_CAUSE:
      //  const [, next] = this.findErrorLeafSiblings(node.id);
      //  if (next >= 0) {
      //    const nodeId = this._treeSate.pickErrorLeafByIndex(next);
      //    if (nodeId) {
      //      this.focusNode(nodeId);
      //    }
      //  }
      //  break;
      //case TreeNodeAction.PREV_ROOT_CAUSE:
      //  const [previous] = this.findErrorLeafSiblings(node.id);
      //  if (previous >= 0) {
      //    const nodeId = this._treeSate.pickErrorLeafByIndex(previous);
      //    if (nodeId) {
      //      this.focusNode(nodeId);
      //    }
      //  }
      //  break;
      default:
        break;
    }
  }

  focusNode(nodeId: string): void {
    this._treeSate
      .expandNode(nodeId)
      .pipe(
        map((isExpanded) => (isExpanded ? nodeId : undefined)),
        filter((isExpanded) => !!isExpanded),
        tap((nodeId) => this._treeSate.selectNode(nodeId!)),
        switchMap((nodeId) => timer(500).pipe(map(() => nodeId))),
      )
      .subscribe((nodeId) => {
        this.tree()?.scrollToNode?.(nodeId);
      });
  }

  //private findErrorLeafSiblings(nodeId: string): [number, number] {
  //  const errorLeafs = this._treeSate.errorLeafs();
  //  const currentLeafIndex = errorLeafs ? errorLeafs.indexOf(nodeId) : -1;
  //  if (!!errorLeafs?.length && currentLeafIndex >= 0) {
  //    const total = errorLeafs.length;
  //    const next = (currentLeafIndex + 1) % total;
  //    const prev = currentLeafIndex - 1 < 0 ? total - 1 : currentLeafIndex - 1;

  //    return [prev, next];
  //  }

  //  return [-1, -1];
  //}
}
