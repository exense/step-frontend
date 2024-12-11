import { inject, Injectable } from '@angular/core';
import {
  AggregatedReportView,
  ArtefactService,
  ArtefactTreeNode,
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
    const children = (item.children ?? []).map((child) =>
      this.convertItem(child, { parentId: id, isParentVisuallySkipped }),
    );

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
}
