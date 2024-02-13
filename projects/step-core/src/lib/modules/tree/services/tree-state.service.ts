import { FlatTreeControl } from '@angular/cdk/tree';
import { inject, Injectable, OnDestroy } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BehaviorSubject, combineLatest, map, Observable, of, Subject, tap } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Mutable, PlanTreeAction } from '../../../shared';
import { DropType } from '../shared/drop-type.enum';
import { TreeFlatNode } from '../shared/tree-flat-node';
import { TreeNode } from '../shared/tree-node';
import { TreeNodeUtilsService } from './tree-node-utils.service';
import { TreeStateInitOptions } from '../shared/tree-state-init-options.interface';

type FieldAccessor = Mutable<Pick<TreeStateService<any, any>, 'hideRoot'>>;

const unique = <T>(item: T, index: number, self: T[]) => self.indexOf(item) === index;

const DEFAULT_OPTIONS: TreeStateInitOptions = {
  expandAllByDefault: true,
};

@Injectable()
export class TreeStateService<T, N extends TreeNode> implements OnDestroy {
  private _treeNodeUtils = inject<TreeNodeUtilsService<T, N>>(TreeNodeUtilsService);

  private nodesAccessCache = new Map<string, N>();

  readonly treeControl = new FlatTreeControl<TreeFlatNode>(
    (node) => node.level,
    (node) => node.expandable
  );
  readonly treeFlattener = new MatTreeFlattener(
    (node: TreeNode, level: number) => {
      return { ...node, level };
    },
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.children || []
  );
  readonly dataSource = new MatTreeFlatDataSource<TreeNode, TreeFlatNode>(this.treeControl, this.treeFlattener);

  private originalRoot?: T;
  private rootNode$ = new BehaviorSubject<N | undefined>(undefined);

  private selectedInsertionParentId$ = new BehaviorSubject<string | undefined>(undefined);

  private selectedNodeIds$ = new BehaviorSubject<string[]>([]);
  readonly selectedNode$ = this.selectedNodeIds$.pipe(map((nodeIds) => this.findNodeById(nodeIds[0])));

  readonly selectedNodes$ = combineLatest([this.selectedNodeIds$, this.rootNode$]).pipe(
    map(([nodes, root]) => {
      const selectedNodeIds = nodes.filter((nodeId) => nodeId !== root?.id);
      return selectedNodeIds.map((nodeId) => this.treeControl.dataNodes.find((n) => n.id === nodeId)!);
    })
  );

  private editNodeIdInternal$ = new BehaviorSubject<string | undefined>(undefined);
  readonly editNodeId$ = this.editNodeIdInternal$.asObservable();

  private treeUpdateInternal$ = new Subject<T>();
  readonly treeUpdate$ = this.treeUpdateInternal$.asObservable();

  readonly hideRoot: boolean = false;

  init(root: T, options: TreeStateInitOptions = {}): void {
    const { selectedNodeIds, expandAllByDefault, hideRoot } = { ...DEFAULT_OPTIONS, ...options };
    (this as FieldAccessor).hideRoot = !!hideRoot;
    this.originalRoot = root;
    const rootNode = this._treeNodeUtils.convertItem(root);
    this.nodesAccessCache.clear();
    this.rootNode$.next(rootNode);

    if (!this.selectedInsertionParentId$.value) {
      this.selectedInsertionParentId$.next(rootNode.id);
    }

    if (selectedNodeIds) {
      this.selectedNodeIds$.next(selectedNodeIds);
    } else {
      this.selectedNodeIds$.next([...this.selectedNodeIds$.value]);
    }
    this.updateData([rootNode]);
    if (expandAllByDefault) {
      this.expandAll();
    } else if (hideRoot) {
      this.expandNode(rootNode.id).subscribe();
    }
  }

  isMultipleNodesSelected(): boolean {
    return this.selectedNodeIds$.value.length > 1;
  }

  isNodeSelected(nodeId: string): Observable<boolean> {
    return this.selectedNodeIds$.pipe(map((nodes) => nodes.includes(nodeId)));
  }

  isNodeSelectedForInsert(nodeId: string): Observable<boolean> {
    return combineLatest([this.selectedNodeIds$, this.selectedInsertionParentId$]).pipe(
      map(([selectedNodes, selectedInsertionParentId]) => {
        if (selectedNodes.length > 1) {
          return false;
        }
        return selectedInsertionParentId === nodeId;
      })
    );
  }

  isRoot(nodeId: string): Observable<boolean> {
    return this.rootNode$.pipe(map((rootNode) => rootNode?.id === nodeId));
  }

  selectNodeById(nodeId: string): void {
    this.selectedNodeIds$.next([nodeId]);
  }

  editSelectedNode(): void {
    const nodeId = this.selectedNodeIds$.value[0];
    this.editNodeIdInternal$.next(nodeId);
  }

  updateEditNodeName(name: string): void {
    const editNodeId = this.editNodeIdInternal$.value;
    if (!editNodeId) {
      return;
    }
    const isUpdated = this._treeNodeUtils.updateNodeData(this.originalRoot!, editNodeId, { name });
    if (isUpdated) {
      if (this.selectedNodeIds$.value.includes(editNodeId)) {
        this.selectedNodeIds$.next([editNodeId]);
      }
      this.refresh();
    }
    this.cancelEdit();
  }

  cancelEdit(): void {
    this.editNodeIdInternal$.next(undefined);
  }

  toggleSkip(forceSkip?: boolean): void {
    const nodes = this.getSelectedNodes();
    if (!nodes.length) {
      return;
    }

    let isUpdated = false;

    nodes.forEach(node => {
      const isSkipped = forceSkip || !node.isSkipped;
      isUpdated = this._treeNodeUtils.updateNodeData(this.originalRoot!, node.id, { isSkipped }) || isUpdated
    })

    if (isUpdated) {
      this.refresh();
    }
  }

  selectNode(node: N, $event?: MouseEvent, preventIfAlreadySelected: boolean = false): void {
    const selectedNodeIds = this.selectedNodeIds$.value;

    if (preventIfAlreadySelected && selectedNodeIds.includes(node.id!)) {
      return;
    }

    if ($event?.ctrlKey) {
      if (selectedNodeIds.includes(node.id!)) {
        this.selectedNodeIds$.next(selectedNodeIds.filter((nodeId) => nodeId !== node.id));
      } else {
        this.selectedNodeIds$.next([...selectedNodeIds, node.id!].filter(unique));
        this.selectedInsertionParentId$.next(node.id!);
      }
    } else if ($event?.shiftKey) {
      if (selectedNodeIds.includes(node.id!)) {
        this.selectedNodeIds$.next(selectedNodeIds.filter((nodeId) => nodeId !== node.id));
      } else {
        const visibleNodes = this.getVisibleNodes();
        const nodeIndex = visibleNodes.findIndex((item) => item.id === node.id);
        const selectedIndexes = visibleNodes.reduce((res, item, i) => {
          if (selectedNodeIds.includes(item.id!)) {
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
          this.selectedNodeIds$.next([node.id!]);
          this.selectedInsertionParentId$.next(node.id!);
        } else {
          const [start, end] = [nodeIndex, minDistanceIndex].sort();
          const ids = visibleNodes.slice(start, end + 1).map((node) => node.id!);
          this.selectedNodeIds$.next([...selectedNodeIds, ...ids].filter(unique));
          this.selectedInsertionParentId$.next(node.id!);
        }
      }
    } else {
      this.selectedNodeIds$.next([node.id!]);
      this.selectedInsertionParentId$.next(node.id!);
    }
  }

  insertSelectedNodesTo(nodeId: string, dropType: DropType): void {
    const selectedNodeIds = this.selectedNodeIds$.value.filter((nodeId) => nodeId !== this.rootNode$.value?.id);
    if (selectedNodeIds.length === 0) {
      return;
    }

    type InsideInsertStrategy = 'append' | 'prepend';
    let insideInsertStrategy: InsideInsertStrategy = 'append';

    let parentId = nodeId;

    if (dropType === DropType.AFTER && this.isNodeExpanded(parentId)) {
      const parent = this.findNodeById(parentId);
      // drop after for expanded node with children interpret like drop inside, as first children
      // but don't count dragging children
      const parentChildren = (parent?.children || []).filter((child) => !selectedNodeIds.includes(child.id));
      if (parentChildren.length > 0) {
        dropType = DropType.INSIDE;
        insideInsertStrategy = 'prepend';
      }
    }

    if (dropType !== DropType.INSIDE) {
      const node = this.findNodeById(parentId);
      if (!node?.parentId) {
        return;
      }
      parentId = node?.parentId;
    }

    const parent = this.findNodeById(parentId);
    if (!parent) {
      return;
    }

    const nodesToAdd = selectedNodeIds.map((nodeId) => this.findNodeById(nodeId)).filter((x) => !!x);

    const children = ([...parent.children!] as N[]).filter((child) => !selectedNodeIds.includes(child.id));

    if (dropType === DropType.INSIDE) {
      if (insideInsertStrategy === 'append') {
        children.push(...(nodesToAdd as N[]));
      } else {
        children.unshift(...(nodesToAdd as N[]));
      }
    } else if (dropType === DropType.AFTER || dropType === DropType.BEFORE) {
      const siblingIndex = children.findIndex((child) => child.id === nodeId)!;
      let start: number;
      if (dropType === DropType.BEFORE) {
        start = siblingIndex;
      } else if (dropType === DropType.AFTER) {
        start = siblingIndex + 1;
      }
      children.splice(start!, 0, ...(nodesToAdd as N[]));
    } else {
      children.push(...(nodesToAdd as N[]));
    }

    this._treeNodeUtils.updateChildren(this.originalRoot!, parentId, children, 'replace');
    this.selectedInsertionParentId$.next(parentId);
    this.refresh();
  }

  canInsertTo(nodeId: string, checkParent: boolean): boolean {
    const artefacts = this.selectedNodeIds$.value
      .filter(
        (nodeId) => nodeId !== this.rootNode$.value?.id && !!this.treeControl.dataNodes.find((n) => n.id === nodeId)
      )
      .map((nodeId) => this.findNodeById(nodeId))
      .filter((x) => !!x) as N[];

    if (artefacts.length === 0) {
      return false;
    }

    let parentIdToCheck = nodeId;
    if (checkParent) {
      const node = this.findNodeById(parentIdToCheck);
      if (!node?.parentId) {
        return false;
      }
      parentIdToCheck = node?.parentId;
    }

    return this.isPossibleToInsert(parentIdToCheck, ...artefacts);
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

      const newParentsAndNodes = nodesIndicesGroup.reduce((res, group) => {
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
      }, {} as Record<string, N[]>);

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
    if (!this.isPossibleToInsert(parentId, ...newNodes)) {
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
    this.selectedNodeIds$.next([lastChild.id!]);
  }

  addChildrenToSelectedNode(...children: T[]): void {
    const parentId = this.selectedInsertionParentId$.value;
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
    this.selectedNodeIds$.next([lastParent!.id!]);
    this.selectedInsertionParentId$.next(lastParent!.id!);
  }

  findNodeById(id?: string, options?: { parent?: N; useCache?: boolean }): N | undefined {
    if (!id) {
      return undefined;
    }

    const useCache = options?.useCache ?? true;

    if (useCache && this.nodesAccessCache.has(id)) {
      return this.nodesAccessCache.get(id);
    }

    const parent = options?.parent ?? this.rootNode$.value;

    if (parent?.id === id) {
      this.nodesAccessCache.set(id, parent);
      return parent;
    }

    if (!parent || (parent?.children || []).length === 0) {
      return undefined;
    }

    let result = parent.children!.find((child) => child.id === id) as N;
    if (result) {
      this.nodesAccessCache.set(id, result);
      return result;
    }

    result = parent
      .children!.map((child) => this.findNodeById(id, { parent: child as N, useCache }))
      .find((res) => !!res) as N;

    if (result) {
      this.nodesAccessCache.set(id, result);
    }

    return result;
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
    this.treeControl.dataNodes.forEach((node) => {
      this.treeControl.expand(node);
    });
  }

  collapseAll(): void {
    this.treeControl.dataNodes.forEach((node) => {
      this.treeControl.collapse(node);
    });
  }

  getSelectedNodes(): N[] {
    const ids = this.selectedNodeIds$.value;

    const result = ids.map((id) => this.findNodeById(id)).filter((x) => !!x) as N[];

    return result;
  }

  getExpandedNodeIds(): string[] {
    const expandedNodes = (this.treeControl.dataNodes || [])
      .filter((node) => this.treeControl.isExpanded(node))
      .map((node) => node.id);
    return expandedNodes;
  }

  ngOnDestroy(): void {
    this.nodesAccessCache.clear();
    this.rootNode$.complete();
    this.selectedNodeIds$.complete();
    this.selectedInsertionParentId$.complete();
    this.treeUpdateInternal$.complete();
    this.editNodeIdInternal$.complete();
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
    const selectedNodeIds = this.selectedNodeIds$.value.filter((nodeId) => nodeId !== this.rootNode$.value?.id);

    const relationDictionary = selectedNodeIds.reduce((result, nodeId) => {
      const flatNode = this.treeControl.dataNodes.find((n) => n.id === nodeId);
      const parentId = flatNode!.parentId!;
      if (!result[parentId]) {
        result[parentId] = [nodeId];
      } else {
        result[parentId].push(nodeId);
      }
      return result;
    }, {} as Record<string, string[]>);

    return Object.entries(relationDictionary).map(([parentId, nodeIds]) => ({ parentId, nodeIds }));
  }

  private getVisibleNodes(): N[] {
    const result: N[] = [];
    const addExpandedChildren = (node: N, expanded: string[]) => {
      result.push(node);
      if (expanded.includes(node.id!)) {
        node.children!.map((child) => addExpandedChildren(child as N, expanded));
      }
    };
    this.dataSource.data.forEach((node) => {
      addExpandedChildren(
        node as N,
        this.treeControl.expansionModel.selected.map((node) => node.id)
      );
    });
    return result;
  }

  private updateData(nodes: N[]): void {
    const expandedNodes = this.getExpandedNodeIds();
    this.treeControl.expansionModel.clear();
    this.dataSource.data = nodes;
    expandedNodes.forEach((id) => this.expandNodeInternal(id));
  }

  private isPossibleToInsert(newParentId: string, ...itemsToInsert: N[]): boolean {
    // If new parent is a child of itemsToInsert, prevent the insert
    const newParentFoundIn = itemsToInsert
      .map((item) => !!this.findNodeById(newParentId!, { parent: item, useCache: false }))
      .filter((isFound) => isFound);

    // Allow the insertion, if new parent doesn't exist in items to insert
    return newParentFoundIn.length === 0;
  }

  private refresh(): void {
    const root = this._treeNodeUtils.convertItem(this.originalRoot!);
    this.nodesAccessCache.clear();
    this.updateData([root]);
    this.rootNode$.next(root);
    this.treeUpdateInternal$.next(this.originalRoot!);
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
          catchError(() => of(false))
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
        })
      );
    }, expandChild(first));

    return result$;
  }

  private isNodeExpanded(nodeId: string): boolean {
    return this.treeControl.expansionModel.selected.map((node) => node.id).includes(nodeId);
  }

  private expandNodeInternal(nodeId: string): void {
    const node = this.treeControl.dataNodes.find((node) => node.id === nodeId);
    if (node?.children?.length) {
      this.treeControl.expand(node);
    }
  }

  private collapseNodeInternal(nodeId: string): void {
    const node = this.treeControl.dataNodes.find((node) => node.id === nodeId);
    if (node) {
      this.treeControl.collapse(node);
    }
  }

  private toggleNodeInternal(nodeId: string): void {
    const node = this.treeControl.dataNodes.find((node) => node.id === nodeId);
    if (node?.children?.length) {
      this.treeControl.toggle(node);
    }
  }
}
