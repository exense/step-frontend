import { inject, Injectable } from '@angular/core';
import {
  AggregatedReportView,
  ArtefactService,
  ArtefactTreeNode,
  TreeNode,
  TreeNodeUtilsService,
} from '@exense/step-core';
import { AggregatedTreeNode } from '../shared/aggregated-tree-node';

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
    const expandable = (item?.children?.length ?? -1) > 0;
    const children = (item.children ?? []).map((child) =>
      this.convertItem(child, { parentId: id, isParentVisuallySkipped }),
    );
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
    };
    console.log('NODE', result);
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
}
