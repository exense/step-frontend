import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractArtefact } from '../../../../client/generated';
import { DragDataService } from '../../../drag-drop';
import { TreeStateService } from '../../../tree';
import { ArtefactNodeSource } from '../../types/artefact-node-source.enum';
import { ArtefactTreeNode } from '../../types/artefact-tree-node';

@Component({
  selector: 'step-plan-drop-hint',
  templateUrl: './plan-drop-hint.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanDropHintComponent {
  private readonly _dragData = inject(DragDataService);
  private readonly _treeState = inject<TreeStateService<AbstractArtefact, ArtefactTreeNode>>(TreeStateService);
  private readonly dragData = toSignal(this._dragData.dragData$);

  readonly node = input.required<ArtefactTreeNode>();
  readonly dropArea = input<string>();

  protected readonly ArtefactNodeSource = ArtefactNodeSource;
  protected readonly target = computed(() => {
    const node = this.node();
    const draggedElement = this.dragData();
    const droppedArea = this.dropArea() ?? node.id;
    if (!draggedElement) {
      return undefined;
    }
    const proposedDrop = { draggedElement, droppedArea };
    const disabled = this._treeState.canDropTo?.(proposedDrop) === false;
    const resolvedDrop = disabled ? proposedDrop : (this._treeState.resolveDrop?.(proposedDrop) ?? proposedDrop);
    const destination = this._treeState.findNodeById(resolvedDrop.droppedArea as string);
    const section = destination?.nodeType ?? ArtefactNodeSource.MAIN;
    const owner =
      section === ArtefactNodeSource.MAIN ? destination : this._treeState.findNodeById(destination?.parentId);
    return { disabled, section, name: owner?.name ?? node.name };
  });
}
