import {
  AbstractArtefact,
  ArtefactRefreshNotificationService,
  ArtefactService,
  ArtefactTreeNode,
  ArtefactTreeNodeType,
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

  private displayInsertContainersFor?: string;

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

    const forceDisplay = this.displayInsertContainersFor === id;

    let children: ArtefactTreeNode[] = [];

    if (forceDisplay && !originalArtefact?.children?.length) {
      const items = this.createPseudoContainer(ArtefactTreeNodeType.items, originalArtefact.children, {
        parentId: id,
        forceDisplay,
        isParentVisuallySkipped: isVisuallySkipped,
      })!;
      children.push(items);
    } else {
      children = (originalArtefact?.children || []).map((child) =>
        this.convertItem(child, { parentId: id, isParentVisuallySkipped: isVisuallySkipped }),
      );
    }

    const before = this.createPseudoContainer(ArtefactTreeNodeType.before, originalArtefact.before?.steps, {
      parentId: id,
      forceDisplay,
      isParentVisuallySkipped: isVisuallySkipped,
    });
    if (before) {
      children.unshift(before);
    }

    const after = this.createPseudoContainer(ArtefactTreeNodeType.after, originalArtefact.after?.steps, {
      parentId: id,
      forceDisplay,
      isParentVisuallySkipped: isVisuallySkipped,
    });
    if (after) {
      children.push(after);
    }

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
      nodeType: ArtefactTreeNodeType.artefact,
    };
  }

  updateChildren(
    root: AbstractArtefact,
    nodeId: string,
    children: ArtefactTreeNode[],
    updateType: 'append' | 'replace',
  ): void {
    const [nodeType, id] = this.parseNodeId(nodeId);

    //Remove children for their previous parents
    children
      .map((child) => {
        // First find all parent - children chains
        const parentId = child.parentId ? this.parseNodeId(child.parentId)[1] : undefined;
        const parent = parentId ? this.findArtefactById(root, parentId) : undefined;
        if (!parent?.children && !parent?.before && !parent?.after) {
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
        if (parent?.children) {
          parent!.children = parent!.children!.filter(
            (artefact: AbstractArtefact) => child.originalArtefact !== artefact,
          );
        }
        if (parent?.before?.steps) {
          parent!.before!.steps = parent!.before!.steps!.filter(
            (artefact: AbstractArtefact) => child.originalArtefact !== artefact,
          );
        }
        if (parent?.after?.steps) {
          parent!.after!.steps = parent!.after!.steps!.filter(
            (artefact: AbstractArtefact) => child.originalArtefact !== artefact,
          );
        }
      });

    const newParent = this.findArtefactById(root, id);
    if (!newParent) {
      return;
    }
    const artefacts = children
      .map((child) => child.originalArtefact)
      .filter((artefact) => !!artefact) as AbstractArtefact[];
    if (updateType === 'replace') {
      switch (nodeType) {
        case ArtefactTreeNodeType.before:
          newParent.before = { steps: artefacts };
          break;
        case ArtefactTreeNodeType.after:
          newParent.after = { steps: artefacts };
          break;
        default:
          newParent.children = artefacts;
          break;
      }
    } else {
      switch (nodeType) {
        case ArtefactTreeNodeType.before:
          newParent.before = newParent.before ?? {};
          newParent.before.steps = newParent.before.steps || [];
          newParent.before.steps.push(...artefacts);
          break;
        case ArtefactTreeNodeType.after:
          newParent.after = newParent.after ?? {};
          newParent.after.steps = newParent.after.steps || [];
          newParent.after.steps.push(...artefacts);
          break;
        default:
          newParent.children = newParent.children || [];
          newParent.children.push(...artefacts);
          break;
      }
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

  getNodeAdditionalClasses(node: ArtefactTreeNode): string[] {
    const result: string[] = [];
    if (node.nodeType !== ArtefactTreeNodeType.artefact && !node?.children?.length) {
      result.push('empty-pseudo-node');
    }
    return result;
  }

  setPseudoContainersVisibility(artefactId: string): boolean {
    const isNeedToUpdate = this.displayInsertContainersFor !== artefactId;
    this.displayInsertContainersFor = artefactId;
    return isNeedToUpdate;
  }

  hidePseudoContainers(): boolean {
    const isNeedToUpdate = !!this.displayInsertContainersFor;
    this.displayInsertContainersFor = undefined;
    return isNeedToUpdate;
  }

  private findArtefactById(parent: AbstractArtefact, id?: string): AbstractArtefact | undefined {
    if (!id) {
      return undefined;
    }

    const itemsToProceed = [parent];
    while (itemsToProceed.length) {
      const item = itemsToProceed.shift();
      if (item?.id === id) {
        return item;
      }
      itemsToProceed.push(...(item?.before?.steps ?? []), ...(item?.children ?? []), ...(item?.after?.steps ?? []));
    }

    return undefined;
  }

  private createPseudoContainer(
    nodeType: ArtefactTreeNodeType.before | ArtefactTreeNodeType.after | ArtefactTreeNodeType.items,
    childArtefacts: AbstractArtefact[] | undefined,
    params: { parentId: string; forceDisplay?: boolean; isParentVisuallySkipped?: boolean },
  ): ArtefactTreeNode | undefined {
    const { parentId, isParentVisuallySkipped, forceDisplay } = params;
    if (!childArtefacts?.length && !forceDisplay) {
      return undefined;
    }
    const id = `${nodeType}_${parentId}`;
    let name = '';
    switch (nodeType) {
      case ArtefactTreeNodeType.after:
        name = 'After';
        break;
      case ArtefactTreeNodeType.before:
        name = 'Before';
        break;
      default:
        name = 'Items';
        break;
    }
    const isSkipped = false;
    const isVisuallySkipped = isParentVisuallySkipped ?? false;
    const isDragDisabled = true;
    const icon = 'chevron-left';
    const children = (childArtefacts ?? []).map((child) =>
      this.convertItem(child, { parentId: id, isParentVisuallySkipped: isVisuallySkipped }),
    );
    const expandable = children.length > 0;
    return {
      id,
      name,
      isSkipped,
      isVisuallySkipped,
      icon,
      expandable,
      children,
      parentId,
      nodeType,
      isDragDisabled,
    };
  }

  parseNodeId(nodeId: string): [ArtefactTreeNodeType, string] {
    if (
      nodeId.startsWith(ArtefactTreeNodeType.after) ||
      nodeId.startsWith(ArtefactTreeNodeType.before) ||
      nodeId.startsWith(ArtefactTreeNodeType.items)
    ) {
      return nodeId.split('_') as [ArtefactTreeNodeType, string];
    }
    return [ArtefactTreeNodeType.artefact, nodeId];
  }
}
