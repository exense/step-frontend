import {
  AbstractArtefact,
  ArtefactRefreshNotificationService,
  ArtefactService,
  ArtefactTreeNode,
  TreeNode,
  TreeNodeUtilsService,
} from '@exense/step-core';
import { inject, Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class ArtefactTreeNodeUtilsService
  implements OnDestroy, TreeNodeUtilsService<AbstractArtefact, ArtefactTreeNode>, ArtefactRefreshNotificationService
{
  private _artefactTypes = inject(ArtefactService);
  private refreshArtefactInternal$ = new Subject<void>();
  readonly refreshArtefact$ = this.refreshArtefactInternal$.asObservable();

  ngOnDestroy(): void {
    this.refreshArtefactInternal$.complete();
  }

  convertItem(
    originalArtefact: AbstractArtefact,
    params?: { parentId?: string; isParentVisuallySkipped?: boolean },
  ): ArtefactTreeNode {
    const id = originalArtefact.id!;
    const { parentId, isParentVisuallySkipped } = params ?? {};
    const name = originalArtefact.attributes?.['name'] || '';
    const isSkipped = !!originalArtefact.skipNode?.value;
    const isVisuallySkipped = isSkipped || isParentVisuallySkipped;
    const icon = this._artefactTypes.getArtefactType(originalArtefact?._class)?.icon ?? this._artefactTypes.defaultIcon;
    const expandable = (originalArtefact?.children?.length ?? -1) > 0;
    const children = (originalArtefact?.children || []).map((child) =>
      this.convertItem(child, { parentId: id, isParentVisuallySkipped: isVisuallySkipped }),
    );

    return {
      id,
      name,
      isSkipped,
      isVisuallySkipped,
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
    updateType: 'append' | 'replace',
  ): void {
    //Remove children for their previous parents
    children
      .map((child) => {
        // First find all parent - children chains
        const parent = child.parentId ? this.findArtefactById(root, child.parentId) : undefined;
        if (!parent?.children) {
          return undefined;
        }
        return { parent, child };
      })
      .forEach((chain) => {
        if (!chain) {
          return;
        }
        const { parent, child } = chain;
        // Remove children after all chains were found to avoid side effects, when children wil be lost
        parent!.children = parent!.children!.filter(
          (artefact: AbstractArtefact) => child.originalArtefact !== artefact,
        );
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
      itemToChange.skipNode = { ...itemToChange.skipNode!, value: data.isSkipped };
      isUpdated = true;
    }

    if (data.name !== undefined) {
      itemToChange.attributes!['name'] = data.name;
      isUpdated = true;
    }

    if (isUpdated) {
      this.refreshArtefactInternal$.next();
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
