import { inject, Injectable, OnDestroy } from '@angular/core';
import {
  AbstractArtefact,
  ArtefactClass,
  ArtefactNodeSource,
  ArtefactTreeNode,
  DropInfo,
  TreeStateService,
} from '@exense/step-core';
import { ArtefactTreeNodeUtilsService } from './artefact-tree-node-utils.service';
import { ControlDropInfo } from '../types/control-drop-info.interface';
import { ControlType } from '../types/control-type.enum';

@Injectable()
export class ArtefactTreeStateService
  extends TreeStateService<AbstractArtefact, ArtefactTreeNode>
  implements OnDestroy
{
  private _artefactTreeNodeUtils = inject(ArtefactTreeNodeUtilsService);
  private timerId?: number;
  private nodeId?: string;

  override canDropTo({ draggedElement, droppedArea, additionalInfo }: DropInfo): boolean {
    const parentId = droppedArea as string;
    const parent = this.findNodeById(parentId);
    if (!parent) {
      return false;
    }
    if (additionalInfo === 'first' && parent.nodeType !== undefined && !parent.children?.length) {
      return false;
    }
    if (additionalInfo && additionalInfo !== 'first') {
      const sibling = parent.children?.find((child) => child.id === additionalInfo) as ArtefactTreeNode | undefined;
      if (!sibling?.originalArtefact) {
        return false;
      }
    }
    if (!draggedElement) {
      return true;
    }

    if (typeof draggedElement === 'string') {
      const candidates = this.findSubtreeRootsAmongIds([...this.selectedNodeIds(), draggedElement]);
      if (
        !this.canInsertTo(candidates, parentId) ||
        (typeof additionalInfo === 'string' && candidates.includes(additionalInfo))
      ) {
        return false;
      }
    }
    if (!this.dropRequiresAfterSection(draggedElement)) {
      return true;
    }
    if (parent.nodeType !== undefined) {
      return parent.nodeType === ArtefactNodeSource.AFTER || parent.nodeType === ArtefactNodeSource.AFTER_THREAD;
    }
    return additionalInfo === undefined || this.isInAfterSection(parent);
  }

  override resolveDrop(dropInfo: DropInfo): DropInfo {
    const parent = this.findNodeById(dropInfo.droppedArea as string);
    if (
      !parent ||
      parent.nodeType !== undefined ||
      dropInfo.additionalInfo !== undefined ||
      !this.dropRequiresAfterSection(dropInfo.draggedElement)
    ) {
      return dropInfo;
    }
    this.showPseudoContainers(parent.id, true);
    return { ...dropInfo, droppedArea: `${ArtefactNodeSource.AFTER}|${parent.id}` };
  }

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

  override notifyInsertionComplete(): void {
    this.hidePseudoContainers();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    clearTimeout(this.timerId);
  }

  private dropRequiresAfterSection(draggedElement: unknown): boolean {
    if (typeof draggedElement === 'string') {
      const candidates = this.findSubtreeRootsAmongIds([...this.selectedNodeIds(), draggedElement]);
      return candidates.some((id) => this.requiresAfterSection(this.findNodeById(id)?.originalArtefact));
    }
    const control = draggedElement as ControlDropInfo | undefined;
    return control?.type === ControlType.ARTEFACT && control.id === ArtefactClass.PERFORMANCE_ASSERT;
  }

  private requiresAfterSection(artefact?: AbstractArtefact): boolean {
    return (
      artefact?._class === ArtefactClass.PERFORMANCE_ASSERT ||
      !!artefact?.children?.some((child) => this.requiresAfterSection(child))
    );
  }

  private isInAfterSection(node: ArtefactTreeNode): boolean {
    let current: ArtefactTreeNode | undefined = node;
    while (current) {
      if (current.nodeType === ArtefactNodeSource.AFTER || current.nodeType === ArtefactNodeSource.AFTER_THREAD) {
        return true;
      }
      if (current.nodeType === ArtefactNodeSource.BEFORE || current.nodeType === ArtefactNodeSource.BEFORE_THREAD) {
        return false;
      }
      current = this.findNodeById(current.parentId);
    }
    return false;
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
    this.refresh({ emitTreeUpdate: false });
    this.expandNodes([id, ...this._artefactTreeNodeUtils.getPseudoNodesIds(id)]);
  }

  private hidePseudoContainers(): void {
    clearTimeout(this.timerId);
    this.timerId = undefined;
    this.nodeId = undefined;
    const needsToRefresh = this._artefactTreeNodeUtils.hidePseudoContainers();
    if (needsToRefresh) {
      this.refresh({ emitTreeUpdate: false });
    }
  }
}
