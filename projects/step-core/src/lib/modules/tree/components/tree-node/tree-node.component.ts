import { Component, computed, EventEmitter, inject, input, Input, Output, ViewEncapsulation } from '@angular/core';
import { TreeNode } from '../../shared/tree-node';
import { TreeStateService } from '../../services/tree-state.service';
import { TreeFlatNode } from '../../shared/tree-flat-node';
import { TreeNodeTemplateContainerService } from '../../services/tree-node-template-container.service';

const ICON_EXPANDED = 'chevron-down';
const ICON_COLLAPSED = 'chevron-right';

@Component({
  selector: 'step-tree-node',
  templateUrl: './tree-node.component.html',
  styleUrl: './tree-node.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class TreeNodeComponent {
  private _treeState = inject<TreeStateService<any, TreeNode>>(TreeStateService);
  protected readonly _treeNodeTemplateContainer = inject(TreeNodeTemplateContainerService);

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

  @Input() canToggle: boolean = false;
  @Input() dragDisabled: boolean = false;
  @Output() contextMenu = new EventEmitter<{ event: MouseEvent; nodeId: string }>();

  toggle(): void {
    this._treeState.toggleNode(this.node().id);
  }

  openContextMenu(event: MouseEvent): void {
    const nodeId = this.node().id;
    this.contextMenu.emit({ event, nodeId });
  }
}
