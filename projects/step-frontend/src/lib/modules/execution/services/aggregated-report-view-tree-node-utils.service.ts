import { inject, Injectable } from '@angular/core';
import {
  AggregatedReportView,
  ArtefactNodeSource,
  ArtefactService,
  chooseStatusWithMostPriority,
  TreeNode,
  TreeNodeUtilsService,
} from '@exense/step-core';
import { AggregatedTreeNode, AggregatedTreeNodeType } from '../shared/aggregated-tree-node';
import { v5 } from 'uuid';
import { Status } from '../../_common/shared/status.enum';

const HASH_NAMESPACE = 'e9903ee9-1674-45a6-a044-62702dfe0865';

@Injectable()
export class AggregatedReportViewTreeNodeUtilsService
  implements TreeNodeUtilsService<AggregatedReportView, AggregatedTreeNode>
{
  private _artefactTypes = inject(ArtefactService);

  private importantNodeIds = new Set<string>();

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

    const beforeContainer = this.createPseudoContainer(ArtefactNodeSource.BEFORE, item, id);
    const beforeThreadContainer = this.createPseudoContainer(ArtefactNodeSource.BEFORE_THREAD, item, id);
    const afterContainer = this.createPseudoContainer(ArtefactNodeSource.AFTER, item, id);
    const afterThreadContainer = this.createPseudoContainer(ArtefactNodeSource.AFTER_THREAD, item, id);

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

    const iconClassName = ['larger-icon'];
    const statuses = Object.keys(item?.countByStatus ?? {}) as Status[];
    const priorityStatus = chooseStatusWithMostPriority(...statuses);
    if (priorityStatus) {
      iconClassName.push(`step-icon-${priorityStatus}`);
    }

    return {
      id,
      artefactId,
      name,
      isSkipped: false,
      isVisuallySkipped: isParentVisuallySkipped ?? false,
      icon,
      iconClassName: iconClassName.join(' '),
      expandable,
      children,
      parentId,
      originalArtefact,
      singleInstanceReportNode: item.singleInstanceReportNode,
      artefactHash: item.artefactHash,
      countByStatus: item.countByStatus,
      nodeType: AggregatedTreeNodeType.AGGREGATED_INFO,
      hasDescendantInvocations: item.hasDescendantInvocations,
      countByErrorMessage: item.countByErrorMessage,
      countByChildrenErrorMessage: item.countByChildrenErrorMessage,
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

  getNodeAdditionalClasses(node: AggregatedTreeNode): string[] {
    const result: string[] = [];

    if (this.importantNodeIds.has(node.id)) {
      result.push('aggregated-important-node');
    }

    return result;
  }

  getUniqueId(artefactId: string, parentId?: string): string {
    const source = !parentId ? artefactId : `${parentId}.${artefactId}`;
    return v5(source, HASH_NAMESPACE);
  }

  markIdAsImportant(nodeId: string): void {
    this.importantNodeIds.add(nodeId);
  }

  cleanupImportantIds(): void {
    this.importantNodeIds.clear();
  }
}
