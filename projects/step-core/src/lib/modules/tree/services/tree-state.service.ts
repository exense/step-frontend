import { computed, inject, Injectable, OnDestroy, signal } from '@angular/core';
import { map, Observable, of, Subject, tap } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { TreeNode } from '../types/tree-node';
import { TreeNodeUtilsService } from './tree-node-utils.service';
import { TreeStateInitOptions } from '../types/tree-state-init-options.interface';
import { TreeFlattenerService } from './tree-flattener.service';

const DEFAULT_OPTIONS: TreeStateInitOptions = {
  expandAllByDefault: true,
};

@Injectable()
export class TreeStateService<T, N extends TreeNode> implements OnDestroy {
  private _treeFlattener = inject(TreeFlattenerService);
  private _treeNodeUtils = inject<TreeNodeUtilsService<T, N>>(TreeNodeUtilsService);

  private originalRoot?: T;

  private editNodeIdInternal = signal<string | undefined>(undefined);
  readonly editNodeId = this.editNodeIdInternal.asReadonly();

  private treeUpdateInternal$ = new Subject<T>();
  readonly treeUpdate$ = this.treeUpdateInternal$.asObservable();

  private rootNode = signal<N | undefined>(undefined);
  private hideRootInternal = signal(false);
  private selectedInsertionParentId = signal<string | undefined>(undefined);
  private treeData = computed(() => this._treeFlattener.flattenTree(this.rootNode()));
  private selectedNodeIdsInternal = signal<string[]>([]);
  private expandedNodeIdsInternal = signal<string[]>([]);

  readonly flatTree = computed(() => {
    const { tree } = this.treeData();
    const expandedNodeIds = this.expandedNodeIdsInternal();
    const collapsedNodeIds = tree
      .filter((node) => node.hasChild && !expandedNodeIds.includes(node.id))
      .map((node) => node.id);

    return tree.filter((node) => !node.parentPath.some((id) => collapsedNodeIds.includes(id)));
  });

  readonly hideRoot = this.hideRootInternal.asReadonly();
  readonly selectedNodeIds = this.selectedNodeIdsInternal.asReadonly();
  readonly expandedNodeIds = this.expandedNodeIdsInternal.asReadonly();

  readonly selectedForInsertCandidate = computed(() => {
    const selectedNodeIds = this.selectedNodeIdsInternal();
    const selectedInsertionParentId = this.selectedInsertionParentId();
    if (selectedNodeIds.length === 0) {
      return null;
    }
    return selectedInsertionParentId;
  });

  readonly selectedNode = computed(() => {
    const { accessCache } = this.treeData();
    const id = this.selectedNodeIdsInternal()[0];
    return accessCache.get(id) as N | undefined;
  });
  readonly selectedNodes = computed(() => {
    const { accessCache } = this.treeData();
    const ids = this.selectedNodeIdsInternal();
    return ids.map((id) => accessCache.get(id) as N);
  });

  init(root: T, options: TreeStateInitOptions = {}): void {
    const { selectedNodeIds, expandAllByDefault, hideRoot } = { ...DEFAULT_OPTIONS, ...options };
    this.hideRootInternal.set(!!hideRoot);
    this.originalRoot = root;
    const rootNode = this._treeNodeUtils.convertItem(root);
    this.rootNode.set(rootNode);

    if (!this.selectedInsertionParentId()) {
      this.selectedInsertionParentId.set(rootNode.id);
    }

    if (selectedNodeIds) {
      this.selectedNodeIdsInternal.set(selectedNodeIds);
    }

    if (expandAllByDefault) {
      this.expandAll();
    } else if (hideRoot) {
      this.expandNode(rootNode.id).subscribe();
    }
  }

  isMultipleNodesSelected(): boolean {
    return this.selectedNodeIdsInternal().length > 1;
  }

  rootNodeId(): string | undefined {
    return this.rootNode()?.id;
  }

  selectNodeById(nodeId: string): void {
    this.selectedNodeIdsInternal.set([nodeId]);
  }

  editSelectedNode(): void {
    const nodeId = this.selectedNodeIdsInternal()[0];
    this.editNodeIdInternal.set(nodeId);
  }

  updateEditNodeName(name: string): void {
    const editNodeId = this.editNodeIdInternal();
    if (!editNodeId) {
      return;
    }
    const isUpdated = this._treeNodeUtils.updateNodeData(this.originalRoot!, editNodeId, { name });
    if (isUpdated) {
      if (this.selectedNodeIdsInternal().includes(editNodeId)) {
        this.selectedNodeIdsInternal.set([editNodeId]);
      }
      this.refresh();
    }
    this.cancelEdit();
  }

  cancelEdit(): void {
    this.editNodeIdInternal.set(undefined);
  }

  toggleSkip(forceSkip?: boolean): void {
    const nodes = this.getSelectedNodes();
    if (!nodes.length) {
      return;
    }

    let isUpdated = false;

    nodes.forEach((node) => {
      let isSkipped;
      if (forceSkip !== undefined) {
        isSkipped = forceSkip;
      } else {
        isSkipped = !node.isSkipped;
      }
      isUpdated = this._treeNodeUtils.updateNodeData(this.originalRoot!, node.id, { isSkipped }) || isUpdated;
    });

    if (isUpdated) {
      this.refresh();
    }
  }

  selectNode(nodeOrId: N | TreeNode | string, $event?: MouseEvent, preventIfAlreadySelected: boolean = false): void {
    let nId = typeof nodeOrId === 'string' ? nodeOrId : nodeOrId.id;

    const selectedNodeIds = new Set(this.selectedNodeIdsInternal());

    if (preventIfAlreadySelected && selectedNodeIds.has(nId)) {
      return;
    }

    if ($event?.ctrlKey) {
      if (selectedNodeIds.has(nId)) {
        this.selectedNodeIdsInternal.update((selected) => selected.filter((nodeId) => nodeId !== nId));
      } else {
        this.addMultipleNodesToSelectionAndKeepOrder(nId);
        this.selectedInsertionParentId.set(nId);
      }
    } else if ($event?.shiftKey) {
      if (selectedNodeIds.has(nId)) {
        this.selectedNodeIdsInternal.update((selected) => selected.filter((nodeId) => nodeId !== nId));
      } else {
        const visibleNodes = this.flatTree();
        const nodeIndex = visibleNodes.findIndex((item) => item.id === nId);
        const selectedIndexes = visibleNodes.reduce((res, item, i) => {
          if (selectedNodeIds.has(item.id!)) {
            res.push(i);
          }
          return res;
        }, [] as number[]);

        let minDistance = -1;
        let minDistanceIndex = -1;
        selectedIndexes.forEach((index) => {
          const distance = Math.abs(index - nodeIndex);
          if (minDistance < 0 || distance < minDistance) {
            minDistance = distance;
            minDistanceIndex = index;
          }
        });

        if (minDistanceIndex < 0) {
          this.selectedNodeIdsInternal.set([nId]);
          this.selectedInsertionParentId.set(nId);
        } else {
          const [start, end] = [nodeIndex, minDistanceIndex].sort((a, b) => a - b);
          const ids = visibleNodes.slice(start, end + 1).map((node) => node.id!);
          this.addMultipleNodesToSelectionAndKeepOrder(...ids);
          this.selectedInsertionParentId.set(nId);
        }
      }
    } else {
      this.selectedNodeIdsInternal.set([nId]);
      this.selectedInsertionParentId.set(nId);
    }
  }

  notifyPotentialInsert?(potentialParentId: string): void;
  notifyInsertionComplete?(): void;

  insertNodesTo(
    insertCandidatesIds: string[],
    newParentId: string,
    insertParams?: { insertAtFirstPosition?: boolean; insertAfterSiblingId?: string },
  ): void {
    const { accessCache } = this.treeData();
    const nodesIds = insertCandidatesIds.filter((nodeId) => nodeId !== this.rootNode()?.id && accessCache.has(nodeId));
    if (nodesIds.length === 0) {
      return;
    }

    const parent = this.findNodeById(newParentId);
    if (!parent) {
      return;
    }

    const nodesToAdd = nodesIds.map((nodeId) => this.findNodeById(nodeId)).filter((x) => !!x) as N[];
    const children = ([...parent.children!] as N[]).filter((child) => !nodesIds.includes(child.id));

    if (!insertParams) {
      children.push(...nodesToAdd);
    } else if (insertParams.insertAtFirstPosition) {
      children.unshift(...nodesToAdd);
    } else if (insertParams.insertAfterSiblingId) {
      const siblingIndex = children.findIndex((child) => child.id === insertParams.insertAfterSiblingId);
      if (siblingIndex < 0) {
        return;
      }
      children.splice(siblingIndex + 1, 0, ...nodesToAdd);
    } else {
      return;
    }

    this._treeNodeUtils.updateChildren(this.originalRoot!, newParentId, children, 'replace');
    this.selectedInsertionParentId.set(newParentId);
    this.refresh();
    if (!this.isNodeExpanded(newParentId)) {
      this.expandNodeInternal(newParentId);
    }
  }

  canInsertTo(insertCandidatesIds: string[], newParentId: string): boolean {
    const { accessCache } = this.treeData();
    const nodesIds = insertCandidatesIds.filter((nodeId) => nodeId !== this.rootNode()?.id && accessCache.has(nodeId));

    if (nodesIds.length === 0) {
      return false;
    }

    return this.isPossibleToInsert(newParentId, nodesIds);
  }

  moveSelectedNodesIn(direction: 'prevSibling' | 'nextSibling'): void {
    const parentChildRelations = this.getParentChildRelationsForSelectedNodes();

    if (!parentChildRelations.length) {
      return;
    }

    const nodesToExpand = new Set<string>();
    let hasChange = false;

    parentChildRelations.forEach(({ parentId, nodeIds }) => {
      const parent = this.findNodeById(parentId);
      if (!parent) {
        return;
      }

      let children = parent.children as N[];

      const nodesIndices = nodeIds
        .map((nodeId) => children.findIndex((child) => child.id === nodeId))
        .filter((index) => index >= 0)
        .sort((a, b) => a - b);

      const nodesIndicesGroup = nodesIndices
        .reduce((res, index, i, self) => {
          if (res.length === 0) {
            res.push([]);
          }

          const lastGroup = res[res.length - 1];
          lastGroup.push(index);

          const nextIndex = self[i + 1];
          if (nextIndex !== undefined && nextIndex - index > 1) {
            res.push([]);
          }

          return res;
        }, [] as number[][])
        .filter((group) => group.length > 0);

      const newParentsAndNodes = nodesIndicesGroup.reduce(
        (res, group) => {
          let possibleParent: N | undefined;
          if (direction === 'nextSibling') {
            const last = group[group.length - 1];
            possibleParent = children[last + 1];
          } else {
            const first = group[0];
            possibleParent = children[first - 1];
          }

          if (possibleParent && !nodeIds.includes(possibleParent.id)) {
            const newChildren = group.map((index) => children[index]);
            res[possibleParent.id] =
              direction === 'nextSibling'
                ? [...newChildren, ...((possibleParent.children ?? []) as N[])]
                : [...((possibleParent.children ?? []) as N[]), ...newChildren];
          }

          return res;
        },
        {} as Record<string, N[]>,
      );

      const realNodesToMove = Object.values(newParentsAndNodes).reduce((res, nodes) => [...res, ...nodes], []);
      if (realNodesToMove.length === 0) {
        return;
      }

      children = children.filter((node) => !realNodesToMove.includes(node));

      hasChange = true;

      this._treeNodeUtils.updateChildren(this.originalRoot!, parentId, children, 'replace');
      Object.entries(newParentsAndNodes).forEach(([newParentId, newChildren]) => {
        this._treeNodeUtils.updateChildren(this.originalRoot!, newParentId, newChildren, 'replace');
      });

      Object.keys(newParentsAndNodes).forEach((nodeId) => nodesToExpand.add(nodeId));
    });

    if (hasChange) {
      this.refresh();
      this.expandNodes(Array.from(nodesToExpand));
    }
  }

  moveSelectedNodesOut(): void {
    const parentChildRelations = this.getParentChildRelationsForSelectedNodes();

    if (!parentChildRelations.length) {
      return;
    }

    let hasChange = false;

    parentChildRelations.forEach(({ parentId, nodeIds }) => {
      const parent = this.findNodeById(parentId);
      const grandParent = parent?.parentId ? this.findNodeById(parent.parentId!) : undefined;
      if (!grandParent) {
        return;
      }

      let children = parent!.children as N[];
      let grandParentChildren = grandParent.children as N[];

      const anchorIndex = grandParentChildren.findIndex((item) => item.id === parentId);
      const grandParentChildrenBefore = grandParentChildren.filter((_, i) => i < anchorIndex!);
      const grandParentChildrenAfter = grandParentChildren.filter((_, i) => i > anchorIndex!);

      const nodesToMoveOut = children.filter((node) => nodeIds.includes(node.id));
      if (nodesToMoveOut.length === 0) {
        return;
      }

      children = children.filter((node) => !nodesToMoveOut.includes(node));
      grandParentChildren = [...grandParentChildrenBefore, parent!, ...nodesToMoveOut, ...grandParentChildrenAfter];

      this._treeNodeUtils.updateChildren(this.originalRoot!, parentId, children, 'replace');
      this._treeNodeUtils.updateChildren(this.originalRoot!, grandParent.id, grandParentChildren, 'replace');

      hasChange = true;
    });

    if (hasChange) {
      this.refresh();
    }
  }

  moveSelectedNodes(direction: 'up' | 'down'): void {
    const parentChildRelations = this.getParentChildRelationsForSelectedNodes();

    if (!parentChildRelations.length) {
      return;
    }

    let hasChange = false;

    parentChildRelations.forEach(({ parentId, nodeIds }) => {
      const parent = this.findNodeById(parentId);

      if (!parent || !parent.children) {
        return;
      }

      const grandParent = parent.parentId ? this.findNodeById(parent.parentId) : undefined;
      const grandParentChildren = grandParent?.children as N[] | undefined;
      const anchorIndex = grandParentChildren?.findIndex((item) => item.id === parentId);
      const grandParentChildrenBefore = grandParentChildren?.filter((_, i) => i < anchorIndex!);
      const grandParentChildrenAfter = grandParentChildren?.filter((_, i) => i > anchorIndex!);

      let children = parent.children as N[];
      let hasLocalChange = false;
      let hasGrandParentChange = false;

      const nodesIndices = nodeIds
        .map((nodeId) => {
          const index = children.findIndex((child) => child.id === nodeId);

          return {
            node: children[index],
            index,
          };
        })
        .sort((a, b) => a.index - b.index);

      const calcNodesForMovement = () => {
        const nodes = nodesIndices.map((nodeIndex) => nodeIndex.node);
        const before = children.filter((child, index) => index < nodesIndices[0].index);
        const after = children.filter((child, index) => index > nodesIndices[nodesIndices.length - 1].index);
        return { nodes, before, after };
      };

      if (direction === 'up') {
        let moveUpIndex = 0;

        if (grandParentChildrenBefore) {
          while (nodesIndices[0]?.index === moveUpIndex) {
            const { node } = nodesIndices.shift()!;
            grandParentChildrenBefore.push(node);
            hasGrandParentChange = true;
            moveUpIndex++;
          }
        }

        if (nodesIndices.length > 0 && nodesIndices[0].index > moveUpIndex) {
          const { nodes, before, after } = calcNodesForMovement();
          children = [...before.slice(0, before.length - 1), ...nodes, before[before.length - 1], ...after];
          hasLocalChange = true;
        }
      }

      if (direction === 'down') {
        let moveDownIndex = children.length - 1;

        if (grandParentChildrenAfter) {
          while (nodesIndices[nodesIndices.length - 1]?.index === moveDownIndex) {
            const { node } = nodesIndices.pop()!;
            grandParentChildrenAfter.unshift(node);
            hasGrandParentChange = true;
            moveDownIndex--;
          }
        }

        if (nodesIndices.length > 0 && nodesIndices[nodesIndices.length - 1].index < moveDownIndex) {
          const { nodes, before, after } = calcNodesForMovement();
          children = [...before, after[0], ...nodes, ...after.slice(1)];
          hasLocalChange = true;
        }
      }

      if (hasLocalChange) {
        this._treeNodeUtils.updateChildren(this.originalRoot!, parentId, children, 'replace');
      }

      if (hasGrandParentChange) {
        const grandParentChildren = [...grandParentChildrenBefore!, parent, ...grandParentChildrenAfter!];
        this._treeNodeUtils.updateChildren(this.originalRoot!, parent.parentId!, grandParentChildren, 'replace');
      }

      hasChange = hasChange || hasLocalChange || hasGrandParentChange;
    });

    if (hasChange) {
      this.refresh();
    }
  }

  insertChildren(parentId: string | undefined, newChildren: T[], insertIndex?: number): void {
    if (!parentId) {
      return;
    }
    const parent = this.findNodeById(parentId);
    if (!parent) {
      return;
    }
    const newNodes = newChildren.map((child) => this._treeNodeUtils.convertItem(child));
    if (
      !this.isPossibleToInsert(
        parentId,
        newNodes.map((node) => node.id),
      )
    ) {
      return;
    }

    const children = [...(parent.children ?? [])] as N[];
    if (insertIndex === undefined || insertIndex >= children.length) {
      this._treeNodeUtils.updateChildren(this.originalRoot!, parentId, newNodes, 'append');
    } else {
      children.splice(insertIndex, 0, ...newNodes);
      this._treeNodeUtils.updateChildren(this.originalRoot!, parentId, children, 'replace');
    }

    this.refresh();

    if (!this.isNodeExpanded(parentId)) {
      this.expandNodeInternal(parentId);
    }

    const lastChild = newNodes[newNodes.length - 1];
    this.selectedNodeIdsInternal.set([lastChild.id!]);
  }

  addChildrenToSelectedNode(...children: T[]): void {
    const parentId = this.selectedInsertionParentId();
    this.insertChildren(parentId, children);
  }

  removeSelectedNodes(): void {
    const parentChildRelations = this.getParentChildRelationsForSelectedNodes();
    if (parentChildRelations.length === 0) {
      return;
    }

    parentChildRelations.forEach(({ parentId, nodeIds }) => {
      const parent = this.findNodeById(parentId)!;
      if (parent) {
        const children = parent.children!.filter((child) => !nodeIds.includes(child.id)) as N[];
        this._treeNodeUtils.updateChildren(this.originalRoot!, parentId, children, 'replace');
      }
    });

    this.refresh();

    const parents = parentChildRelations
      .map(({ parentId }) => this.findNodeById(parentId))
      .filter((parent) => !!parent);
    const lastParent = parents[parents.length - 1];
    this.selectedNodeIdsInternal.set([lastParent!.id!]);
    this.selectedInsertionParentId.set(lastParent!.id!);
  }

  findNodeById(id?: string): N | undefined {
    if (!id) {
      return undefined;
    }

    const { accessCache } = this.treeData();
    return accessCache.get(id) as N | undefined;
  }

  toggleNode(nodeId: string): void {
    const checkChildren = !!this._treeNodeUtils.hasChildren && !!this._treeNodeUtils.loadChildren;

    if (checkChildren && this._treeNodeUtils.hasChildren!(nodeId) && !this.isNodeExpanded(nodeId)) {
      const node = this.findNodeById(nodeId)!;
      if ((node.children || []).length === 0) {
        this._treeNodeUtils.loadChildren!(node).subscribe(() => {
          this.refresh();
          this.toggleNodeInternal(nodeId);
        });
      } else {
        this.toggleNodeInternal(nodeId);
      }
    } else {
      this.toggleNodeInternal(nodeId);
    }
  }

  expandNodes(nodeIds: string[]): void {
    nodeIds.forEach((id) => this.expandNodeInternal(id));
  }

  expandNode(nodeId: string): Observable<boolean>;
  expandNode(path: string[]): Observable<boolean>;
  expandNode(nodeIdOrPath: string | string[]): Observable<boolean> {
    if (nodeIdOrPath instanceof Array) {
      const path = nodeIdOrPath;
      return this.expandPath(path);
    }

    const nodeId = nodeIdOrPath;

    const path = [nodeId];
    let node = this.findNodeById(nodeId);
    while (!!node?.parentId) {
      path.unshift(node.parentId);
      node = this.findNodeById(node.parentId);
    }

    return this.expandPath(path);
  }

  reloadChildrenForNode(nodeId: string): void {
    if (!this._treeNodeUtils.loadChildren) {
      return;
    }
    const node = this.findNodeById(nodeId)!;
    this._treeNodeUtils.loadChildren(node).subscribe(() => {
      this.refresh();
    });
  }

  expandAll(): void {
    const { tree, accessCache } = this.treeData();
    const nodeIdsToExpand = tree.map((node) => node.id).filter((nodeId) => !!accessCache.get(nodeId)?.children?.length);
    this.expandedNodeIdsInternal.set(nodeIdsToExpand);
  }

  collapseAll(): void {
    this.expandedNodeIdsInternal.set([]);
  }

  getSelectedNodes(): N[] {
    return this.selectedNodes();
  }

  getExpandedNodeIds(): string[] {
    return this.expandedNodeIdsInternal();
  }

  ngOnDestroy(): void {
    this.treeUpdateInternal$.complete();
  }

  getNodePath(node?: N): string[] {
    if (!node) {
      return [];
    }
    const result = [node.id];
    while (!!node?.parentId) {
      result.unshift(node.parentId);
      node = this.findNodeById(node.parentId);
    }
    return result;
  }

  private getParentChildRelationsForSelectedNodes(): { nodeIds: string[]; parentId: string }[] {
    const selectedNodeIds = this.selectedNodeIdsInternal().filter((nodeId) => nodeId !== this.rootNode()?.id);
    const { parentsCache } = this.treeData();

    const relationDictionary = selectedNodeIds.reduce(
      (result, nodeId) => {
        const parentId = parentsCache.get(nodeId)!;
        if (!result[parentId]) {
          result[parentId] = [nodeId];
        } else {
          result[parentId].push(nodeId);
        }
        return result;
      },
      {} as Record<string, string[]>,
    );

    return Object.entries(relationDictionary).map(([parentId, nodeIds]) => ({ parentId, nodeIds }));
  }

  private isPossibleToInsert(newParentId: string, idsToInsert: string[]): boolean {
    const parentNode = this.treeData().tree.find((node) => node.id === newParentId);
    if (!parentNode) {
      return false;
    }
    const isPossibleNodeCycleExits = idsToInsert.some((nodeId) => parentNode.parentPath.includes(nodeId));
    return !isPossibleNodeCycleExits;
  }

  protected isRefreshInProgress = false;

  protected refresh(): void {
    this.isRefreshInProgress = true;
    const root = this._treeNodeUtils.convertItem(this.originalRoot!);
    this.rootNode.set(root);
    this.treeUpdateInternal$.next(this.originalRoot!);
    setTimeout(() => (this.isRefreshInProgress = false), 500);
  }

  private expandPath(path: string[]): Observable<boolean> {
    const checkChildren = !!this._treeNodeUtils.hasChildren && !!this._treeNodeUtils.loadChildren;

    const expandChild = (nodeId: string) => {
      if (this.isNodeExpanded(nodeId)) {
        return of(true);
      }

      if (checkChildren && this._treeNodeUtils.hasChildren!(nodeId)) {
        const node = this.findNodeById(nodeId);
        if (!node) {
          return of(false);
        }
        if ((node.children || []).length > 0) {
          this.expandNodeInternal(node.id);
          return of(true);
        }

        return this._treeNodeUtils.loadChildren!(node).pipe(
          tap(() => {
            this.refresh();
            this.toggleNodeInternal(nodeId);
          }),
          map(() => true),
          catchError(() => of(false)),
        );
      }

      this.expandNodeInternal(nodeId);
      return of(true);
    };

    const [first, ...other] = path;
    const result$ = other.reduce(($res, pathItem) => {
      return $res.pipe(
        switchMap((result) => {
          if (!result) {
            return of(result);
          }
          return expandChild(pathItem);
        }),
      );
    }, expandChild(first));

    return result$;
  }

  isNodeExpanded(nodeId: string): boolean {
    return this.expandedNodeIdsInternal().includes(nodeId);
  }

  private expandNodeInternal(nodeId: string): void {
    const { accessCache } = this.treeData();
    const expandedNodeIds = this.expandedNodeIdsInternal();
    const node = accessCache.get(nodeId);
    if (node?.children?.length && !expandedNodeIds.includes(nodeId)) {
      this.expandedNodeIdsInternal.set([...expandedNodeIds, nodeId]);
    }
  }

  private collapseNodeInternal(nodeId: string): void {
    const expandedNodeIds = this.expandedNodeIdsInternal();
    if (expandedNodeIds.includes(nodeId)) {
      this.expandedNodeIdsInternal.set(expandedNodeIds.filter((id) => id !== nodeId));
    }
  }

  private toggleNodeInternal(nodeId: string): void {
    const expandedNodeIds = this.expandedNodeIdsInternal();
    if (expandedNodeIds.includes(nodeId)) {
      this.collapseNodeInternal(nodeId);
    } else {
      this.expandNodeInternal(nodeId);
    }
  }

  private addMultipleNodesToSelectionAndKeepOrder(...nodeIDs: string[]): void {
    const selected = new Set(this.selectedNodeIdsInternal().concat(...nodeIDs));
    const { tree } = this.treeData();
    const selectedOrdered = tree.reduce((res, node) => {
      if (selected.has(node.id)) {
        res.push(node.id);
      }
      return res;
    }, [] as string[]);
    this.selectedNodeIdsInternal.set(selectedOrdered);
  }
}
