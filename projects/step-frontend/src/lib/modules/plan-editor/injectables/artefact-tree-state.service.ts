import { inject, Injectable } from '@angular/core';
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
export class ArtefactTreeStateService extends TreeStateService<AbstractArtefact, ArtefactTreeNode> {
  private _artefactTreeNodeUtils = inject(ArtefactTreeNodeUtilsService);

  override findNodeById(id?: string): ArtefactTreeNode | undefined {
    const node = super.findNodeById(id);
    if (node || !id) {
      return node;
    }
    const [, parentId] = this._artefactTreeNodeUtils.parseNodeId(id);
    if (parentId === id) {
      return undefined;
    }
    return super.findNodeById(parentId)?.dropSections?.find((section) => section.id === id);
  }

  override canDropTo({ draggedElement, droppedArea, additionalInfo }: DropInfo): boolean {
    const parentId = droppedArea as string;
    const parent = this.findNodeById(parentId);
    if (!parent) {
      return false;
    }
    if (additionalInfo === 'first') {
      const children = parent.nodeType === undefined ? parent.originalArtefact?.children : parent.children;
      if (!children?.length) {
        return false;
      }
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
    return { ...dropInfo, droppedArea: `${ArtefactNodeSource.AFTER}|${parent.id}` };
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
}
