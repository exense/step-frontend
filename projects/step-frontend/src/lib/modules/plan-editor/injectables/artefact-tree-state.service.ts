import { inject, Injectable, OnDestroy } from '@angular/core';
import { AbstractArtefact, ArtefactTreeNode, ArtefactTreeNodeType, TreeStateService } from '@exense/step-core';
import { ArtefactTreeNodeUtilsService } from './artefact-tree-node-utils.service';

@Injectable()
export class ArtefactTreeStateService
  extends TreeStateService<AbstractArtefact, ArtefactTreeNode>
  implements OnDestroy
{
  private _artefactTreeNodeUtils = inject(ArtefactTreeNodeUtilsService);
  private timerId?: number;
  private nodeId?: string;

  override notifyPotentialInsert(potentialParentId: string): void {
    const [_, id] = this._artefactTreeNodeUtils.parseNodeId(potentialParentId);
    if (this.isRefreshInProgress) {
      return;
    }
    this.showPseudoContainers(id);
  }

  override notifyInsertionComplete() {
    this.hidePseudoContainers();
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    clearTimeout(this.timerId);
  }

  private showPseudoContainers(id: string): void {
    if (this.nodeId === id) {
      return;
    }
    clearTimeout(this.timerId);
    this.nodeId = id;
    this.timerId = setTimeout(() => {
      const needsToRefresh = this._artefactTreeNodeUtils.setPseudoContainersVisibility(id);
      if (needsToRefresh) {
        this.refresh();
        this.expandNodes([id, ...this.getPseudoNodesId(id)]);
      }
      this.timerId = undefined;
      this.nodeId = undefined;
    }, 2000) as unknown as number;
  }

  private hidePseudoContainers(): void {
    clearTimeout(this.timerId);
    this.timerId = undefined;
    this.nodeId = undefined;
    const needsToRefresh = this._artefactTreeNodeUtils.hidePseudoContainers();
    if (needsToRefresh) {
      this.refresh();
    }
  }

  private getPseudoNodesId(id: string): string[] {
    return [
      `${ArtefactTreeNodeType.before}_${id}`,
      `${ArtefactTreeNodeType.items}_${id}`,
      `${ArtefactTreeNodeType.after}_${id}`,
    ];
  }
}
