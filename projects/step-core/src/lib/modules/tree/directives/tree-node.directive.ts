import { computed, Directive, forwardRef, inject, input, output } from '@angular/core';
import { TreeStateService } from '../services/tree-state.service';
import { TreeNode } from '../types/tree-node';
import { TreeNodeUtilsService } from '../services/tree-node-utils.service';
import { TreeFlatNode } from '../types/tree-flat-node';
import { TreeNodeData } from '../services/tree-node-data';

const ICON_EXPANDED = 'chevron-down';
const ICON_COLLAPSED = 'chevron-right';

@Directive({
  selector: '[stepTreeNode]',
  host: {
    '[class]': 'containerClasses()',
    '[style.--level]': 'level()',
    '[attr.data-tree-node-id]': 'id()',
  },
  providers: [
    {
      provide: TreeNodeData,
      useExisting: forwardRef(() => TreeNodeDirective),
    },
  ],
})
export class TreeNodeDirective implements TreeNodeData {
  private _treeState = inject<TreeStateService<any, TreeNode>>(TreeStateService);
  private _utils = inject(TreeNodeUtilsService);

  readonly node = input.required<TreeFlatNode>();
  readonly isRootNode = computed(() => this.node().id === this._treeState.rootNodeId());
  readonly isSelected = computed(() => this._treeState.selectedNodeIds().includes(this.node().id));
  readonly isExpanded = computed(() => this._treeState.expandedNodeIds().includes(this.node().id));
  readonly isHidden = computed(() => this._treeState.hideRoot() && this.isRootNode());
  readonly isSelectedForInsert = computed(() => {
    const nodeId = this.node().id;
    const candidate = this._treeState.selectedForInsertCandidate();
    if (candidate === null) {
      return false;
    }
    return candidate === nodeId;
  });
  readonly toggleStateIcon = computed(() => (this.isExpanded() ? ICON_EXPANDED : ICON_COLLAPSED));

  protected containerClasses = computed(() => {
    const treeNode = this.node();
    const result = ['step-tree-node-container'];
    const node = this._treeState?.findNodeById?.(treeNode.id);
    if (!node) {
      return result;
    }
    const classes = this._utils?.getNodeAdditionalClasses?.(node) ?? [];
    result.push(...classes);
    return result;
  });

  readonly canToggle = computed(() => {
    const node = this.node();
    return node.hasChild || node.expandable;
  });

  /** @Output() **/
  readonly contextMenu = output<{ event: MouseEvent; nodeId: string }>();

  readonly id = computed(() => this.node().id);
  readonly level = computed(() => this.node().parentPath.length);
  readonly levelOffset = computed(() => this.level() * 30);

  toggle(): void {
    this._treeState.toggleNode(this.node().id);
  }

  openContextMenu(event: MouseEvent): void {
    const nodeId = this.node().id;
    this.contextMenu.emit({ event, nodeId });
  }
}
