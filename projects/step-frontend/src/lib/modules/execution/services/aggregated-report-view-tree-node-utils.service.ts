import { inject, Injectable } from '@angular/core';
import { AggregatedReportView, ArtefactService, TreeNode, TreeNodeUtilsService } from '@exense/step-core';
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

    const beforeChildren = (item?.children || []).filter((child) => child.parentSource === 'BEFORE');
    const beforeContainer = this.createPseudoContainer('BEFORE', beforeChildren, id);
    const afterChildren = (item?.children || []).filter((child) => child.parentSource === 'AFTER');
    const afterContainer = this.createPseudoContainer('AFTER', afterChildren, id);

    const children = (item?.children || [])
      .filter((child) => child.parentSource !== 'BEFORE' && child.parentSource !== 'AFTER')
      .map((child) => this.convertItem(child, { parentId: id }));

    if (beforeContainer) {
      children.unshift(beforeContainer);
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
    containerType: AggregatedReportView['parentSource'],
    childArtefacts: AggregatedReportView[] | undefined,
    parentId: string,
  ): AggregatedTreeNode | undefined {
    if (!childArtefacts?.length) {
      return undefined;
    }
    const id = `${containerType}_${parentId}`;
    let name = '';
    if (containerType === 'BEFORE') {
      name = 'Before';
    } else if (containerType === 'AFTER') {
      name = 'After';
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
      nodeType: AggregatedTreeNodeType.PSEUDO_CONTAINER,
    };
  }
}
