import { ChangeDetectionStrategy, Component, computed, inject, input, output, ViewEncapsulation } from '@angular/core';
import { TreeNodeDirective } from '../../directives/tree-node.directive';
import { TreeNodeTemplateContainerService } from '../../services/tree-node-template-container.service';
import { DRAG_DROP_EXPORTS, DragDataService, DropInfo } from '../../../drag-drop';
import { toSignal } from '@angular/core/rxjs-interop';
import { StepIconsModule } from '../../../step-icons/step-icons.module';
import { StepMaterialModule } from '../../../step-material/step-material.module';
import { TreeNodeNameComponent } from '../tree-node-name/tree-node-name.component';
import { NgTemplateOutlet } from '@angular/common';
import { TreeStateService } from '../../services/tree-state.service';
import { TreeNode } from '../../types/tree-node';

@Component({
  selector: 'step-tree-node-draggable',
  templateUrl: './tree-node-draggable.component.html',
  styleUrls: ['../tree-node/tree-node.component.scss', './tree-node-draggable.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DRAG_DROP_EXPORTS, StepIconsModule, StepMaterialModule, TreeNodeNameComponent, NgTemplateOutlet],
  hostDirectives: [
    {
      directive: TreeNodeDirective,
      inputs: ['node'],
      outputs: ['contextMenu'],
    },
  ],
  host: {
    '[class.is-drag-in-progress]': 'isDragInProgress()',
    '[class.drop-disabled]': '!isDragInProgress() && isDropTargetDisabled()',
  },
})
export class TreeNodeDraggableComponent {
  private _dragDataService = inject(DragDataService);
  private _treeState = inject<TreeStateService<unknown, TreeNode>>(TreeStateService);

  protected readonly _treeNode = inject(TreeNodeDirective, { self: true });
  protected readonly _treeNodeTemplateContainer = inject(TreeNodeTemplateContainerService);

  /** @Input() **/
  readonly dragDisabled = input(false);

  /** @Input() **/
  readonly dropDisabled = input(false);

  /** @Output() **/
  readonly dragOver = output<DropInfo>();

  /** @Output() **/
  readonly dropNode = output<DropInfo>();

  private readonly dragData = toSignal(this._dragDataService.dragData$);

  protected readonly isDropTargetDisabled = computed(() => {
    const draggedElement = this.dragData();
    const node = this._treeNode.node();
    return !!draggedElement && this._treeState.canDropTo?.({ draggedElement, droppedArea: node.id }) === false;
  });

  protected readonly siblingDropTargets = computed(() => {
    const node = this._treeNode.node();
    const draggedElement = this.dragData();
    const dropDisabled = this.dropDisabled();
    const nextNode = this._treeState.getNextVisibleNode(node.id, { skipDescendants: draggedElement === node.id });
    if (dropDisabled) {
      return [];
    }
    return node.parentPath
      .map((parentId, level) => ({ parentId, level, siblingId: node.parentPath[level + 1] || node.id }))
      .filter(({ parentId, siblingId }) => {
        if (nextNode?.parentPath.includes(siblingId)) {
          return false;
        }
        return (
          this._treeState.canDropTo?.({ draggedElement, droppedArea: parentId, additionalInfo: siblingId }) !== false
        );
      });
  });

  protected readonly canDropFirstChild = computed(() => {
    const node = this._treeNode.node();
    const draggedElement = this.dragData();
    const dropDisabled = this.dropDisabled();
    return (
      !dropDisabled &&
      this._treeState.canDropTo?.({ draggedElement, droppedArea: node.id, additionalInfo: 'first' }) !== false
    );
  });

  protected handleDragOver(): void {
    if (this.dropDisabled() || !this._dragDataService.isDragStarted) {
      return;
    }
    this.dragOver.emit({ draggedElement: this.dragData(), droppedArea: this._treeNode.node().id });
  }

  protected readonly isDragInProgress = computed(() => {
    const dragData = this.dragData();
    const nodeId = this._treeNode.node()?.id;
    return dragData === nodeId;
  });
}
