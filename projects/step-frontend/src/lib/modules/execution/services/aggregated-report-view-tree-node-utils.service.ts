import { inject, Injectable } from '@angular/core';
import {
  AggregatedReportView,
  ArtefactNodeSource,
  ArtefactService,
  TreeNode,
  TreeNodeUtilsService,
} from '@exense/step-core';
import { AggregatedTreeNode, AggregatedTreeNodeType } from '../shared/aggregated-tree-node';
import { v5 } from 'uuid';

const HASH_NAMESPACE = 'e9903ee9-1674-45a6-a044-62702dfe0865';

@Injectable()
export class AggregatedReportViewTreeNodeUtilsService
  implements TreeNodeUtilsService<AggregatedReportView, AggregatedTreeNode>
{
  private _artefactTypes = inject(ArtefactService);

  convertItem(
    item: AggregatedReportView,
    params?: { parentId?: string; isParentVisuallySkipped?: boolean },
  ): AggregatedTreeNode {
    const originalArtefact = item.artefact!;
    const artefactId = originalArtefact.id!;
    const { parentId, isParentVisuallySkipped } = params ?? {};
    const id = this.getUniqueId(artefactId, parentId);
    const name = originalArtefact.attributes?.['name'] ?? '';
    const icon = this._artefactTypes.getArtefactType(originalArtefact._class)?.icon ?? this._artefactTypes.defaultIcon;
    const expandable = !!item?.children?.length;

    const beforeContainer = this.createPseudoContainer(ArtefactNodeSource.BEFORE, item, parentId);
    const beforeThreadContainer = this.createPseudoContainer(ArtefactNodeSource.BEFORE_THREAD, item, parentId);
    const afterContainer = this.createPseudoContainer(ArtefactNodeSource.AFTER, item, parentId);
    const afterThreadContainer = this.createPseudoContainer(ArtefactNodeSource.AFTER_THREAD, item, parentId);

    const children = (item?.children || [])
      .filter(
        (child) => child.parentSource === ArtefactNodeSource.MAIN || child.parentSource === ArtefactNodeSource.SUB_PLAN,
      )
      .map((child) => this.convertItem(child, { parentId: id }));

    if (beforeThreadContainer) {
      children.unshift(beforeThreadContainer);
    }

    if (beforeContainer) {
      children.unshift(beforeContainer);
    }

    if (afterThreadContainer) {
      children.push(afterThreadContainer);
    }

    if (afterContainer) {
      children.push(afterContainer);
    }

    return {
      id,
      artefactId,
      name,
      isSkipped: false,
      isVisuallySkipped: isParentVisuallySkipped ?? false,
      icon,
      expandable,
      children,
      parentId,
      originalArtefact,
      singleInstanceReportNode: item.singleInstanceReportNode,
      artefactHash: item.artefactHash,
      countByStatus: item.countByStatus,
      nodeType: AggregatedTreeNodeType.AGGREGATED_INFO,
    };
  }

  updateChildren(
    root: AggregatedReportView,
    nodeId: string,
    children: AggregatedTreeNode[],
    updateType: 'append' | 'replace',
  ): void {}

  updateNodeData(
    root: AggregatedReportView,
    nodeId: string,
    data: Partial<Pick<TreeNode, 'name' | 'isSkipped'>>,
  ): boolean {
    return false;
  }

  private createPseudoContainer(
    containerType: ArtefactNodeSource,
    parent: AggregatedReportView,
    parentId?: string,
  ): AggregatedTreeNode | undefined {
    const childArtefacts = (parent?.children ?? []).filter((child) => child.parentSource === containerType);
    if (!childArtefacts?.length || !parentId) {
      return undefined;
    }
    const id = `${containerType}|${parentId}`;
    let name = '';
    switch (containerType) {
      case ArtefactNodeSource.BEFORE:
        name = 'Before';
        break;
      case ArtefactNodeSource.BEFORE_THREAD:
        name = 'Before Thread';
        break;
      case ArtefactNodeSource.AFTER_THREAD:
        name = 'After Thread';
        break;
      case ArtefactNodeSource.AFTER:
        name = 'After';
        break;
      default:
        break;
    }
    const isSkipped = false;
    const isVisuallySkipped = false;
    const icon = 'chevron-left';
    const children = (childArtefacts ?? []).map((child) => this.convertItem(child, { parentId: id }));
    const expandable = true;
    return {
      id,
      name,
      isSkipped,
      isVisuallySkipped,
      icon,
      children,
      expandable,
      parentId,
      nodeType: AggregatedTreeNodeType.PSEUDO_CONTAINER,
    };
  }

  private getUniqueId(artefactId: string, parentId?: string): string {
    const source = !parentId ? artefactId : `${parentId}.${artefactId}`;
    return v5(source, HASH_NAMESPACE);
  }
}
