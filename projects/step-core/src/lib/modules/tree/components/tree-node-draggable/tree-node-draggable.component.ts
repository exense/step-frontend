import { ChangeDetectionStrategy, Component, computed, inject, input, output, ViewEncapsulation } from '@angular/core';
import { TreeNodeDirective } from '../../directives/tree-node.directive';
import { TreeNodeTemplateContainerService } from '../../services/tree-node-template-container.service';
import { DRAG_DROP_EXPORTS, DragDataService, DropInfo } from '../../../drag-drop';
import { toSignal } from '@angular/core/rxjs-interop';
import { StepIconsModule } from '../../../step-icons/step-icons.module';
import { StepMaterialModule } from '../../../step-material/step-material.module';
import { TreeNodeNameComponent } from '../tree-node-name/tree-node-name.component';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'step-tree-node-draggable',
  templateUrl: './tree-node-draggable.component.html',
  styleUrls: ['../tree-node/tree-node.component.scss', './tree-node-draggable.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
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
  },
})
export class TreeNodeDraggableComponent {
  private _dragDataService = inject(DragDataService);

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

  private dragData = toSignal(this._dragDataService.dragData$);

  readonly isDragInProgress = computed(() => {
    const dragData = this.dragData();
    const nodeId = this._treeNode.node()?.id;
    return dragData === nodeId;
  });
}
