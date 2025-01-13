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

  private displayInsertContainersFor = new Map<string, boolean>();

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
    const icon = this._artefactTypes.getArtefactType(originalArtefact?._class)?.icon ?? this._artefactTypes.defaultIcon;
    const expandable = (originalArtefact?.children?.length ?? -1) > 0;
    const children = this.createChildNodes(originalArtefact, isVisuallySkipped);

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
        const removePredicate = (artefact: AbstractArtefact) => child.originalArtefact !== artefact;
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

  getNodeAdditionalClasses(node: ArtefactTreeNode): string[] {
    const result: string[] = [];
    if (node.nodeType !== undefined && !node?.children?.length) {
      result.push('empty-pseudo-node');
    }
    return result;
  }

  setPseudoContainersVisibility(artefactId: string, isPersistent: boolean = false): boolean {
    const isNeedToUpdate =
      !this.displayInsertContainersFor.has(artefactId) ||
      this.displayInsertContainersFor.get(artefactId) !== isPersistent;

    Array.from(this.displayInsertContainersFor.keys())
      .filter((key) => this.displayInsertContainersFor.get(key) === false)
      .forEach((key) => this.displayInsertContainersFor.delete(key));

    this.displayInsertContainersFor.set(artefactId, isPersistent);
    return isNeedToUpdate;
  }

  hidePseudoContainers(): boolean {
    const isNeedToUpdate = !!this.displayInsertContainersFor.size;
    this.displayInsertContainersFor.clear();
    return isNeedToUpdate;
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

  getPseudoNodesIds(id: string): string[] {
    return [
      `${ArtefactNodeSource.BEFORE_THREAD}|${id}`,
      `${ArtefactNodeSource.BEFORE}|${id}`,
      `${ArtefactNodeSource.MAIN}|${id}`,
      `${ArtefactNodeSource.AFTER}|${id}`,
      `${ArtefactNodeSource.AFTER_THREAD}|${id}`,
    ];
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

  private createChildNodes(originalArtefact: AbstractArtefact, isVisuallySkipped: boolean): ArtefactTreeNode[] {
    const id = originalArtefact.id!;
    const forceDisplay = this.displayInsertContainersFor.has(id);
    const isThreadGroup = originalArtefact._class === THREAD_GROUP;

    let children: ArtefactTreeNode[] = [];

    if (forceDisplay && !originalArtefact?.children?.length) {
      const items = this.createPseudoContainer(
        ArtefactNodeSource.MAIN,
        originalArtefact,
        forceDisplay,
        isVisuallySkipped,
      );
      children.push(items!);
    } else {
      children = (originalArtefact?.children || []).map((child) =>
        this.convertItem(child, { parentId: id, isParentVisuallySkipped: isVisuallySkipped }),
      );
    }

    if (isThreadGroup) {
      const beforeThread = this.createPseudoContainer(
        ArtefactNodeSource.BEFORE_THREAD,
        originalArtefact,
        forceDisplay,
        isVisuallySkipped,
      );
      if (beforeThread) {
        children.unshift(beforeThread);
      }
    }

    const before = this.createPseudoContainer(
      ArtefactNodeSource.BEFORE,
      originalArtefact,
      forceDisplay,
      isVisuallySkipped,
    );
    if (before) {
      children.unshift(before);
    }

    if (isThreadGroup) {
      const afterThread = this.createPseudoContainer(
        ArtefactNodeSource.AFTER_THREAD,
        originalArtefact,
        forceDisplay,
        isVisuallySkipped,
      );
      if (afterThread) {
        children.push(afterThread);
      }
    }

    const after = this.createPseudoContainer(
      ArtefactNodeSource.AFTER,
      originalArtefact,
      forceDisplay,
      isVisuallySkipped,
    );
    if (after) {
      children.push(after);
    }

    return children;
  }

  private createPseudoContainer(
    nodeType: ArtefactNodeSource,
    originalArtefact: AbstractArtefact,
    forceDisplay?: boolean,
    isParentVisuallySkipped?: boolean,
  ): ArtefactTreeNode | undefined {
    const parentId = originalArtefact.id;
    const isThreadGroup = originalArtefact._class === THREAD_GROUP;
    const threadGroupArtefact = isThreadGroup ? (originalArtefact as ThreadGroupArtefact) : undefined;

    const id = `${nodeType}|${parentId}`;
    let name = '';
    let childContainer: ChildrenBlock | undefined = undefined;
    let childArtefacts: AbstractArtefact[] | undefined = undefined;
    switch (nodeType) {
      case ArtefactNodeSource.AFTER:
        name = 'After';
        childContainer = originalArtefact.after;
        break;
      case ArtefactNodeSource.AFTER_THREAD:
        if (isThreadGroup) {
          name = 'After Thread';
          childContainer = threadGroupArtefact!.afterThread;
        }
        break;
      case ArtefactNodeSource.BEFORE:
        name = 'Before';
        childContainer = originalArtefact.before;
        break;
      case ArtefactNodeSource.BEFORE_THREAD:
        if (isThreadGroup) {
          name = 'Before Thread';
          childContainer = threadGroupArtefact!.beforeThread;
        }
        break;
      default:
        name = 'Steps';
        childArtefacts = originalArtefact.children;
        break;
    }
    if (childContainer) {
      childArtefacts = childContainer.steps;
    }

    if (!childArtefacts?.length && !forceDisplay) {
      return undefined;
    }

    const isDragDisabled = true;
    const isDropDisabled = false;
    const isSkipped = false;
    const isVisuallySkipped = isParentVisuallySkipped ?? false;
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
      childContainer,
      isDragDisabled,
      isDropDisabled,
    };
  }
}
