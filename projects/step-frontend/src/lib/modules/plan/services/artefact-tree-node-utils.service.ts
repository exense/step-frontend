import { AbstractArtefact, ArtefactTypesService, TreeNode, TreeNodeUtilsService } from '@exense/step-core';
import { Injectable } from '@angular/core';
import { ArtefactTreeNode } from '../shared/artefact-tree-node';

@Injectable()
export class ArtefactTreeNodeUtilsService implements TreeNodeUtilsService<AbstractArtefact, ArtefactTreeNode> {
  constructor(private _artefactTypes: ArtefactTypesService) {}

  convertItem(originalArtefact: AbstractArtefact, parentId?: string): ArtefactTreeNode {
    const id = originalArtefact.id!;
    const name = originalArtefact.attributes?.['name'] || '';
    const isSkipped = !!originalArtefact.skipNode?.value;
    const icon = this._artefactTypes.getIconNg2(originalArtefact._class);
    const expandable = (originalArtefact?.children?.length ?? -1) > 0;
    const children = (originalArtefact?.children || []).map((child) => this.convertItem(child, id));

    return {
      id,
      name,
      isSkipped,
      icon,
      expandable,
      children,
      parentId,
      originalArtefact,
    };
  }

  updateChildren(
    root: AbstractArtefact,
    nodeId: string,
    children: ArtefactTreeNode[],
    updateType: 'append' | 'replace'
  ): void {
    children.forEach((child) => {
      const parent = child.parentId ? this.findArtefactById(root, child.parentId) : undefined;
      if (parent?.children) {
        parent.children = parent.children.filter((artefact) => child.originalArtefact !== artefact);
      }
    });

    const newParent = this.findArtefactById(root, nodeId);
    if (!newParent) {
      return;
    }
    const artefacts = children.map((child) => child.originalArtefact);
    if (updateType === 'replace') {
      newParent.children = artefacts;
    } else {
      newParent.children = newParent.children || [];
      newParent.children.push(...artefacts);
    }
  }

  updateNodeData(root: AbstractArtefact, nodeId: string, data: Partial<Pick<TreeNode, 'name' | 'isSkipped'>>): boolean {
    const itemToChange = this.findArtefactById(root, nodeId);
    if (!itemToChange) {
      return false;
    }

    let isUpdated = false;
    if (data.isSkipped !== undefined) {
      itemToChange.skipNode!.value = data.isSkipped;
      isUpdated = true;
    }

    if (data.name !== undefined) {
      itemToChange.attributes!['name'] = data.name;
      isUpdated = true;
    }

    return isUpdated;
  }

  private findArtefactById(parent: AbstractArtefact, id?: string): AbstractArtefact | undefined {
    if (!id) {
      return undefined;
    }

    if (parent.id === id) {
      return parent;
    }

    let result = parent.children!.find((child) => child.id === id);
    if (result) {
      return result;
    }

    result = parent.children!.map((child) => this.findArtefactById(child, id)).find((res) => !!res);

    return result;
  }
}
