import { inject, Injectable } from '@angular/core';
import {
  AbstractArtefact,
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
    const expandable = true;
    const children = (item.children ?? []).map((child) =>
      this.convertItem(child, { parentId: id, isParentVisuallySkipped }),
    );

    children.unshift(this.createDetailsNode(item));

    const result = {
      id,
      name,
      isSkipped: false,
      isVisuallySkipped: isParentVisuallySkipped ?? false,
      icon,
      expandable,
      children,
      parentId,
      originalArtefact,
      countByStatus: item.countByStatus,
      nodeType: AggregatedTreeNodeType.AGGREGATED_INFO,
    };
    return result;
  }

  updateChildren(
    root: AggregatedReportView,
    nodeId: string,
    children: ArtefactTreeNode[],
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
    const name = 'Details';
    const icon = 'file-text';
    return {
      id,
      name,
      icon,
      parentId,
      isSkipped: false,
      isVisuallySkipped: false,
      expandable: true,
      nodeType: AggregatedTreeNodeType.DETAILS_NODE,
      originalArtefact: undefined as any as AbstractArtefact,
      children: [
        {
          id: `details_data_${artefactId}`,
          parentId: id,
          originalArtefact,
          artefactHash: item.artefactHash,
          nodeType: AggregatedTreeNodeType.DETAILS_DATA,
          isSkipped: false,
          isVisuallySkipped: false,
          expandable: false,
        } as AggregatedTreeNode,
      ],
    };
  }
}
