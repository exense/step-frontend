import { Component, EventEmitter, Input, Output, TrackByFunction, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { AbstractArtefact } from '../../../../client/generated';
import { TreeAction } from '../../shared/tree-action';
import { ArtefactFlatNode } from '../../shared/artefact-flat-node';
import { TreeStateService } from '../../services/tree-state.service';

@Component({
  selector: 'step-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss'],
})
export class TreeComponent {
  readonly trackByAction: TrackByFunction<TreeAction> = (index, item) => item.id;

  readonly contextMenuPosition = { x: 0, y: 0 };

  hasChild = (_: number, node: ArtefactFlatNode) => node.expandable;

  @ViewChild('nodeContextMenuTrigger', { static: true, read: MatMenuTrigger }) contextMenuTrigger!: MatMenuTrigger;

  @Input() dragDisabled: boolean = false;

  @Input() actions: TreeAction[] = [];
  @Output() treeContextAction = new EventEmitter<{ actionId: string; node?: AbstractArtefact }>();

  constructor(public _treeState: TreeStateService) {}

  openContextMenu(event: MouseEvent, nodeId: string): void {
    if (!this.actions?.length) {
      return;
    }

    event.preventDefault();
    this.contextMenuPosition.x = event.clientX;
    this.contextMenuPosition.y = event.clientY;
    this.contextMenuTrigger.menuData = { node: this._treeState.findNodeById(nodeId) };
    this.contextMenuTrigger.openMenu();
  }

  handleContextAction(action: TreeAction, node?: AbstractArtefact): void {
    const actionId = action.id;
    this.treeContextAction.emit({ actionId, node });
  }
}
