import { Component, computed, inject } from '@angular/core';
import { TreeStateService } from '../../services/tree-state.service';
import { TreeNode } from '../../types/tree-node';
import { DragDataService } from '../../../drag-drop';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, Observable } from 'rxjs';
import { StepIconsModule } from '../../../step-icons/step-icons.module';

@Component({
  selector: 'step-tree-drag-preview',
  templateUrl: './tree-drag-preview.component.html',
  styleUrl: './tree-drag-preview.component.scss',
  imports: [StepIconsModule],
  standalone: true,
})
export class TreeDragPreviewComponent {
  private _treeState = inject<TreeStateService<any, TreeNode>>(TreeStateService);
  private _dragDataService = inject(DragDataService);

  private draggedId$ = this._dragDataService.dragData$.pipe(
    filter((data) => !data || typeof data === 'string'),
  ) as Observable<string | undefined>;

  private draggedId = toSignal(this.draggedId$, { initialValue: undefined });

  private labelAndIcon = computed(() => {
    const draggedId = this.draggedId();
    const draggedNode = this._treeState.findNodeById(draggedId);
    const selectedNodes = this._treeState.selectedNodes();

    let label = '';
    let icon = '';

    if (draggedNode && !selectedNodes.includes(draggedNode)) {
      selectedNodes.push(draggedNode);
    }

    if (selectedNodes.length === 1) {
      label = selectedNodes[0]?.name ?? '';
      icon = selectedNodes[0]?.icon ?? '';
    } else if (selectedNodes.length > 1) {
      label = `(${selectedNodes.length}) items`;
      icon = 'list';
    }

    return { label, icon };
  });

  readonly label = computed(() => this.labelAndIcon().label);
  readonly icon = computed(() => this.labelAndIcon().icon);
}
