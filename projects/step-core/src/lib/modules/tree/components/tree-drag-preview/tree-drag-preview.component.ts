import { Component, computed, inject } from '@angular/core';
import { TreeStateService } from '../../services/tree-state.service';
import { TreeNode } from '../../shared/tree-node';

@Component({
  selector: 'step-tree-drag-preview',
  templateUrl: './tree-drag-preview.component.html',
  styleUrl: './tree-drag-preview.component.scss',
})
export class TreeDragPreviewComponent {
  private _treeState = inject<TreeStateService<any, TreeNode>>(TreeStateService);

  private labelAndIcon = computed(() => {
    const nodes = this._treeState.selectedNodes();
    let label = '';
    let icon = '';

    if (nodes.length === 1) {
      label = nodes[0].name;
      icon = nodes[0].icon;
    } else if (nodes.length > 1) {
      label = `(${nodes.length}) items`;
      icon = 'list';
    }

    return { label, icon };
  });

  readonly label = computed(() => this.labelAndIcon().label);
  readonly icon = computed(() => this.labelAndIcon().icon);
}
