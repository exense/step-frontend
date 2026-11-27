import {
  AbstractArtefact,
  ArtefactNodeSource,
  ArtefactRefreshNotificationService,
  ArtefactService,
  ArtefactTreeNode,
  ChildrenBlock,
  TreeNode,
  TreeNodeUtilsService,
} from '@exense/step-core';
import { inject, Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { ThreadGroupArtefact } from '../../artefacts/types/thread-group.artefact';

const THREAD_GROUP = 'ThreadGroup';

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
    const isVisuallySkipped = isSkipped ?? isParentVisuallySkipped ?? false;
    const artefactType = this._artefactTypes.getArtefactType(originalArtefact?._class);
    const icon = artefactType?.icon ?? this._artefactTypes.defaultIcon;
    const iconTooltip = artefactType?.label;
    const expandable = (originalArtefact?.children?.length ?? -1) > 0;
    const { children, dropSections } = this.createChildNodes(originalArtefact, isVisuallySkipped);

    return {
      id,
      name,
      isSkipped,
      isVisuallySkipped,
      icon,
      iconTooltip,
      expandable,
      children,
      dropSections,
      parentId,
      originalArtefact,
      nodeType: undefined,
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
        const removePredicate = (artefact: AbstractArtefact): boolean => child.originalArtefact !== artefact;
        if (parent?.children) {
          parent!.children = parent!.children!.filter(removePredicate);
        }
        if (parent?.before?.steps) {
          parent!.before!.steps = parent!.before!.steps!.filter(removePredicate);
        }
        if (parent?.after?.steps) {
          parent!.after!.steps = parent!.after!.steps!.filter(removePredicate);
        }
        if (parent?._class === THREAD_GROUP) {
          const parentThreadGroup = parent as ThreadGroupArtefact;
          if (parentThreadGroup?.beforeThread?.steps) {
            parentThreadGroup!.beforeThread!.steps = parentThreadGroup!.beforeThread!.steps.filter(removePredicate);
          }
          if (parentThreadGroup?.afterThread?.steps) {
            parentThreadGroup!.afterThread!.steps = parentThreadGroup!.afterThread!.steps.filter(removePredicate);
          }
        }
      });

    const newParent = this.findArtefactById(root, id);
    if (!newParent) {
      return;
    }
    const isThreadGroup = newParent._class === THREAD_GROUP;
    const threadGroupParent = isThreadGroup ? (newParent as ThreadGroupArtefact) : undefined;

    const artefacts = children
      .map((child) => child.originalArtefact)
      .filter((artefact) => !!artefact) as AbstractArtefact[];
    if (updateType === 'replace') {
      switch (nodeType) {
        case ArtefactNodeSource.BEFORE:
          newParent.before = { steps: artefacts };
          break;
        case ArtefactNodeSource.AFTER:
          newParent.after = { steps: artefacts };
          break;
        case ArtefactNodeSource.BEFORE_THREAD:
          if (isThreadGroup) {
            threadGroupParent!.beforeThread = { steps: artefacts };
          }
          break;
        case ArtefactNodeSource.AFTER_THREAD:
          if (isThreadGroup) {
            threadGroupParent!.afterThread = { steps: artefacts };
          }
          break;
        default:
          newParent.children = artefacts;
          break;
      }
    } else {
      switch (nodeType) {
        case ArtefactNodeSource.BEFORE:
          newParent.before = newParent.before ?? {};
          newParent.before.steps = newParent.before.steps || [];
          newParent.before.steps.push(...artefacts);
          break;
        case ArtefactNodeSource.AFTER:
          newParent.after = newParent.after ?? {};
          newParent.after.steps = newParent.after.steps || [];
          newParent.after.steps.push(...artefacts);
          break;
        case ArtefactNodeSource.BEFORE_THREAD:
          if (isThreadGroup) {
            threadGroupParent!.beforeThread = threadGroupParent!.beforeThread ?? {};
            threadGroupParent!.beforeThread.steps = threadGroupParent!.beforeThread.steps || [];
            threadGroupParent!.beforeThread.steps.push(...artefacts);
          }
          break;
        case ArtefactNodeSource.AFTER_THREAD:
          if (isThreadGroup) {
            threadGroupParent!.afterThread = threadGroupParent!.afterThread ?? {};
            threadGroupParent!.afterThread.steps = threadGroupParent!.afterThread.steps || [];
            threadGroupParent!.afterThread.steps.push(...artefacts);
          }
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

  parseNodeId(nodeId: string): [ArtefactNodeSource, string] {
    if (
      nodeId.startsWith(ArtefactNodeSource.AFTER) ||
      nodeId.startsWith(ArtefactNodeSource.AFTER_THREAD) ||
      nodeId.startsWith(ArtefactNodeSource.BEFORE) ||
      nodeId.startsWith(ArtefactNodeSource.BEFORE_THREAD) ||
      nodeId.startsWith(ArtefactNodeSource.MAIN)
    ) {
      return nodeId.split('|') as [ArtefactNodeSource, string];
    }
    return [ArtefactNodeSource.MAIN, nodeId];
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
      itemsToProceed.push(
        ...(item?.before?.steps ?? []),
        ...((item as ThreadGroupArtefact)?.beforeThread?.steps ?? []),
        ...(item?.children ?? []),
        ...((item as ThreadGroupArtefact)?.afterThread?.steps ?? []),
        ...(item?.after?.steps ?? []),
      );
    }

    return undefined;
  }

  private createChildNodes(
    originalArtefact: AbstractArtefact,
    isVisuallySkipped: boolean,
  ): Pick<ArtefactTreeNode, 'children' | 'dropSections'> {
    const isThreadGroup = originalArtefact._class === THREAD_GROUP;
    const mainChildren = (originalArtefact.children ?? []).map((child) =>
      this.convertItem(child, { parentId: originalArtefact.id, isParentVisuallySkipped: isVisuallySkipped }),
    );
    const beforeTypes = [ArtefactNodeSource.BEFORE];
    const afterTypes = [ArtefactNodeSource.AFTER];
    if (isThreadGroup) {
      beforeTypes.push(ArtefactNodeSource.BEFORE_THREAD);
      afterTypes.unshift(ArtefactNodeSource.AFTER_THREAD);
    }
    const before = beforeTypes.map((type) => this.createPseudoContainer(type, originalArtefact, isVisuallySkipped));
    const after = afterTypes.map((type) => this.createPseudoContainer(type, originalArtefact, isVisuallySkipped));
    return {
      children: [
        ...before.filter((section) => section.children?.length),
        ...mainChildren,
        ...after.filter((section) => section.children?.length),
      ],
      dropSections: [...before, ...after],
    };
  }

  private createPseudoContainer(
    nodeType: ArtefactNodeSource,
    originalArtefact: AbstractArtefact,
    isParentVisuallySkipped: boolean,
  ): ArtefactTreeNode {
    const parentId = originalArtefact.id;
    const isThreadGroup = originalArtefact._class === THREAD_GROUP;
    const threadGroupArtefact = isThreadGroup ? (originalArtefact as ThreadGroupArtefact) : undefined;

    const id = `${nodeType}|${parentId}`;
    let name = '';
    let icon = '';
    let childContainer: ChildrenBlock | undefined = undefined;
    let childArtefacts: AbstractArtefact[] | undefined = undefined;
    switch (nodeType) {
      case ArtefactNodeSource.AFTER:
        name = 'After (cleanup)';
        icon = 'arrow-right-from-line';
        childContainer = originalArtefact.after;
        break;
      case ArtefactNodeSource.AFTER_THREAD:
        if (isThreadGroup) {
          name = 'After Thread';
          icon = 'arrow-right-from-line';
          childContainer = threadGroupArtefact!.afterThread;
        }
        break;
      case ArtefactNodeSource.BEFORE:
        name = 'Before (init)';
        icon = 'arrow-right-to-line';
        childContainer = originalArtefact.before;
        break;
      case ArtefactNodeSource.BEFORE_THREAD:
        if (isThreadGroup) {
          name = 'Before Thread';
          icon = 'arrow-right-to-line';
          childContainer = threadGroupArtefact!.beforeThread;
        }
        break;
      default:
        name = 'Steps';
        icon = 'circle';
        childArtefacts = originalArtefact.children;
        break;
    }
    if (childContainer) {
      childArtefacts = childContainer.steps;
    }

    const isDragDisabled = true;
    const isDropDisabled = false;
    const isSkipped = false;
    const isVisuallySkipped = isParentVisuallySkipped ?? false;
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
      childContainer,
      isDragDisabled,
      isDropDisabled,
    };
  }
}
