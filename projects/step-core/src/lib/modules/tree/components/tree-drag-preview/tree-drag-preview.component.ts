import { ChangeDetectionStrategy, Component, TrackByFunction } from '@angular/core';
import { ArtefactFlatNode } from '../../shared/artefact-flat-node';
import { TreeStateService } from '../../services/tree-state.service';

@Component({
  selector: 'step-tree-drag-preview',
  templateUrl: './tree-drag-preview.component.html',
  styleUrls: ['./tree-drag-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeDragPreviewComponent {
  constructor(public _treeState: TreeStateService) {}

  readonly trackByNode: TrackByFunction<ArtefactFlatNode> = (index, item) => item.id;
}
