import { inject, Injectable, OnDestroy } from '@angular/core';
import { AbstractArtefact, ArtefactTreeNode, ArtefactNodeSource, TreeStateService } from '@exense/step-core';
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
    if (id === this.selectedForInsertCandidate()) {
      this.showPseudoContainers(id, true);
      return;
    }
    this.showPseudoContainersWithDelay(id);
  }

  override notifyInsertionComplete() {
    this.hidePseudoContainers();
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    clearTimeout(this.timerId);
  }

  private showPseudoContainersWithDelay(id: string): void {
    if (this.nodeId === id) {
      return;
    }
    clearTimeout(this.timerId);
    this.nodeId = id;
    this.timerId = setTimeout(() => {
      this.showPseudoContainers(id);
      this.timerId = undefined;
      this.nodeId = undefined;
    }, 500) as unknown as number;
  }

  private showPseudoContainers(id: string, isPersistent?: boolean): void {
    const needsToRefresh = this._artefactTreeNodeUtils.setPseudoContainersVisibility(id, isPersistent);
    if (!needsToRefresh) {
      return;
    }
    this.refresh();
    this.expandNodes([id, ...this._artefactTreeNodeUtils.getPseudoNodesIds(id)]);
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
}
