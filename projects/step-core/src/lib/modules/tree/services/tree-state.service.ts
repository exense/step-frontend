import { FlatTreeControl } from '@angular/cdk/tree';
import { Injectable, OnDestroy } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BehaviorSubject, combineLatest, map, Observable, of, Subject, tap } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { bfs } from '../../../shared';
import { DropType } from '../shared/drop-type.enum';
import { TreeFlatNode } from '../shared/tree-flat-node';
import { TreeNode } from '../shared/tree-node';
import { TreeNodeUtilsService } from './tree-node-utils.service';

const unique = <T>(item: T, index: number, self: T[]) => self.indexOf(item) === index;

@Injectable()
export class TreeStateService<T, N extends TreeNode> implements OnDestroy {
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

  constructor(private _treeNodeUtils: TreeNodeUtilsService<T, N>) {}

  init(root: T, selectedNodeIds?: string[], expandAllByDefault: boolean = true): void {
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

  toggleSkip(): void {
    const nodeId = this.selectedNodeIds$.value[0];
    const node = this.findNodeById(nodeId);

    if (!node) {
      return;
    }

    const isSkipped = !node.isSkipped;
    const isUpdated = this._treeNodeUtils.updateNodeData(this.originalRoot!, nodeId, { isSkipped });

    if (node.children) {
      const children = bfs({
        items: node.children,
        children: (child) => child.children || [],
      });

      children.forEach((child) => {
        this._treeNodeUtils.updateNodeData(this.originalRoot!, child.id, { isSkipped });
      });
    }

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

    if (dropType === DropType.after && this.isNodeExpanded(parentId)) {
      const parent = this.findNodeById(parentId);
      // drop after for expanded node with children interpret like drop inside, as first children
      // but don't count dragging children
      const parentChildren = (parent?.children || []).filter((child) => !selectedNodeIds.includes(child.id));
      if (parentChildren.length > 0) {
        dropType = DropType.inside;
        insideInsertStrategy = 'prepend';
      }
    }

    if (dropType !== DropType.inside) {
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

    if (dropType === DropType.inside) {
      if (insideInsertStrategy === 'append') {
        children.push(...(nodesToAdd as N[]));
      } else {
        children.unshift(...(nodesToAdd as N[]));
      }
    } else if (dropType === DropType.after || dropType === DropType.before) {
      const siblingIndex = children.findIndex((child) => child.id === nodeId)!;
      let start: number;
      if (dropType === DropType.before) {
        start = siblingIndex;
      } else if (dropType === DropType.after) {
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

  moveSelectedNodes(direction: 'up' | 'down'): void {
    const parentChildRelations = this.getParentChildRelationsForSelectedNodes();
    if (parentChildRelations.length === 0) {
      return;
    }

    let hasChange = false;

    parentChildRelations.forEach(({ parentId, nodeIds }) => {
      const parent = this.findNodeById(parentId);
      const children = (parent?.children || []) as N[];
      let hasLocalChange = false;
      nodeIds.forEach((nodeId) => {
        const childIndex = children.findIndex((child) => child.id === nodeId);

        if (direction === 'up' && childIndex > 0) {
          const sibling = children[childIndex - 1];
          children[childIndex - 1] = children[childIndex];
          children[childIndex] = sibling;
          hasLocalChange = true;
        }

        if (direction === 'down' && childIndex < children.length - 1) {
          const sibling = children[childIndex + 1];
          children[childIndex + 1] = children[childIndex];
          children[childIndex] = sibling;
          hasLocalChange = true;
        }
      });

      if (hasLocalChange) {
        this._treeNodeUtils.updateChildren(this.originalRoot!, parentId, children, 'replace');
      }

      hasChange = hasChange || hasLocalChange;
    });

    if (hasChange) {
      this.refresh();
    }
  }

  addChildrenToSelectedNode(...children: T[]): void {
    const parentId = this.selectedInsertionParentId$.value;
    if (!parentId) {
      return;
    }

    const newNodes = children.map((child) => this._treeNodeUtils.convertItem(child));
    if (!this.isPossibleToInsert(parentId, ...newNodes)) {
      return;
    }

    this._treeNodeUtils.updateChildren(this.originalRoot!, parentId, newNodes, 'append');

    this.refresh();

    if (!this.isNodeExpanded(parentId)) {
      this.expandNodeInternal(parentId);
    }

    const lastChild = newNodes[newNodes.length - 1];
    this.selectedNodeIds$.next([lastChild.id!]);
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

  findNodeById(id?: string, parent?: N, useCache: boolean = true): N | undefined {
    if (!id) {
      return undefined;
    }

    if (useCache && this.nodesAccessCache.has(id)) {
      return this.nodesAccessCache.get(id);
    }

    parent = parent || this.rootNode$.value;

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

    result = parent.children!.map((child) => this.findNodeById(id, child as N, useCache)).find((res) => !!res) as N;

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

  ngOnDestroy(): void {
    this.nodesAccessCache.clear();
    this.rootNode$.complete();
    this.selectedNodeIds$.complete();
    this.selectedInsertionParentId$.complete();
    this.treeUpdateInternal$.complete();
    this.editNodeIdInternal$.complete();
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
    const expandedNodes = (this.treeControl.dataNodes || [])
      .filter((node) => this.treeControl.isExpanded(node))
      .map((node) => node.id);
    this.treeControl.expansionModel.clear();
    this.dataSource.data = nodes;
    expandedNodes.forEach((id) => this.expandNodeInternal(id));
  }

  private isPossibleToInsert(newParentId: string, ...itemsToInsert: N[]): boolean {
    // If new parent is a child of itemsToInsert, prevent the insert
    const newParentFoundIn = itemsToInsert
      .map((item) => !!this.findNodeById(newParentId!, item, false))
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
