import { inject, Injectable } from '@angular/core';
import {
  AggregatedReportView,
  ArtefactNodeSource,
  ArtefactService,
  TreeNode,
  TreeNodeUtilsService,
} from '@exense/step-core';
import { AggregatedTreeNode, AggregatedTreeNodeType } from '../shared/aggregated-tree-node';

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
    const id = originalArtefact.id!;
    const { parentId, isParentVisuallySkipped } = params ?? {};
    const name = originalArtefact.attributes?.['name'] ?? '';
    const icon = this._artefactTypes.getArtefactType(originalArtefact._class)?.icon ?? this._artefactTypes.defaultIcon;
    const expandable = !!item?.children?.length;

    const beforeContainer = this.createPseudoContainer(ArtefactNodeSource.BEFORE, item);
    const beforeThreadContainer = this.createPseudoContainer(ArtefactNodeSource.BEFORE_THREAD, item);
    const afterContainer = this.createPseudoContainer(ArtefactNodeSource.AFTER, item);
    const afterThreadContainer = this.createPseudoContainer(ArtefactNodeSource.AFTER_THREAD, item);

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

  private createDetailsNode(item: AggregatedReportView): AggregatedTreeNode {
    const originalArtefact = item.artefact!;
    const artefactId = originalArtefact.id!;
    const id = `details_${artefactId}`;
    const parentId = artefactId;
    return {
      id,
      parentId,
      name: '',
      icon: '',
      isSkipped: false,
      isVisuallySkipped: false,
      expandable: false,
      nodeType: AggregatedTreeNodeType.DETAILS_NODE,
      originalArtefact,
      artefactHash: item.artefactHash,
    };
  }

  private createPseudoContainer(
    containerType: ArtefactNodeSource,
    parent: AggregatedReportView,
  ): AggregatedTreeNode | undefined {
    const parentId = parent?.artefact?.id;
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
}
