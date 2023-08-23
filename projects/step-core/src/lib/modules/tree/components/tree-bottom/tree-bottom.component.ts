import { Component, inject, Input, TrackByFunction } from '@angular/core';
import { LastVisibleNodeInfo } from '../../shared/last-visible-node-info';
import { TreeStateService } from '../../services/tree-state.service';
import { DropType } from '../../shared/drop-type.enum';

@Component({
  selector: 'step-tree-bottom',
  templateUrl: './tree-bottom.component.html',
  styleUrls: ['./tree-bottom.component.scss'],
})
export class TreeBottomComponent {
  private _treeState = inject<TreeStateService<any, any>>(TreeStateService);

  @Input() bottomInfo: LastVisibleNodeInfo[] = [];

  readonly trackByFn: TrackByFunction<LastVisibleNodeInfo> = (_, item) => item.nodeId;

  handleDropAtBottom(dropNodeId?: string): void {
    if (!dropNodeId) {
      return;
    }
    this._treeState.insertSelectedNodesTo(dropNodeId, DropType.after);
  }
}
