import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, map, Observable, combineLatest, Subject, of, tap } from 'rxjs';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { SelectionModel } from '@angular/cdk/collections';
import { InsertPositionData } from '../shared/insert-position-data';
import { TreeNodeUtilsService } from './tree-node-utils.service';
import { TreeNode } from '../shared/tree-node';
import { TreeFlatNode } from '../shared/tree-flat-node';
import { catchError, switchMap } from 'rxjs/operators';

const unique = <T>(item: T, index: number, self: T[]) => self.indexOf(item) === index;

@Injectable()
export class TreeStateService<T, N extends TreeNode> implements OnDestroy {
  readonly paddingIdent = 15;
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
  readonly expansionModel = new SelectionModel<string>(true);

  private originalRoot?: T;
  private rootNode$ = new BehaviorSubject<N | undefined>(undefined);

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
    this.rootNode$.next(rootNode);
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

  isNodeSelected(nodeId: string): Observable<boolean> {
    return this.selectedNodeIds$.pipe(map((nodes) => nodes.includes(nodeId)));
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
    if (isUpdated) {
      this.refresh();
    }
  }

  selectNode(node: N, $event?: MouseEvent): void {
    const selectedNodeIds = this.selectedNodeIds$.value;

    if ($event?.ctrlKey) {
      if (selectedNodeIds.includes(node.id!)) {
        this.selectedNodeIds$.next(selectedNodeIds.filter((nodeId) => nodeId !== node.id));
      } else {
        this.selectedNodeIds$.next([...selectedNodeIds, node.id!].filter(unique));
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
        } else {
          const [start, end] = [nodeIndex, minDistanceIndex].sort();
          const ids = visibleNodes.slice(start, end + 1).map((node) => node.id!);
          this.selectedNodeIds$.next([...selectedNodeIds, ...ids].filter(unique));
        }
      }
    } else {
      this.selectedNodeIds$.next([node.id!]);
    }
  }

  getFirstSelectedNodeIndex(): number {
    const nodeIds = this.selectedNodeIds$.value.filter((nodeId) => nodeId !== this.rootNode$.value?.id);
    if (nodeIds.length === 0) {
      return -1;
    }
    const index = this.treeControl.dataNodes.findIndex((node) => node.id === nodeIds[0]);
    return index;
  }

  canInsertSelectedNodesAt(insertPositionData: InsertPositionData): boolean {
    const artefacts = this.selectedNodeIds$.value
      .filter(
        (nodeId) => nodeId !== this.rootNode$.value?.id && !!this.treeControl.dataNodes.find((n) => n.id === nodeId)
      )
      .map((nodeId) => this.findNodeById(nodeId))
      .filter((x) => !!x) as N[];

    if (artefacts.length === 0) {
      return false;
    }

    const { parent } = this.determineNewParentToInsert(insertPositionData, false);
    if (!parent) {
      return false;
    }

    return this.isPossibleToInsert(parent.id, ...artefacts);
  }

  handleDrop(insertPositionData: InsertPositionData): void {
    const selectedNodeIds = this.selectedNodeIds$.value.filter((nodeId) => nodeId !== this.rootNode$.value?.id);
    const flatNodesToMove = selectedNodeIds.map((nodeId) => this.treeControl.dataNodes.find((n) => n.id === nodeId));

    if (flatNodesToMove.length === 0) {
      return;
    }

    const { parent: currentParent, siblingId, isLevelDown } = this.determineNewParentToInsert(insertPositionData);

    if (!currentParent) {
      return;
    }

    const nodes = flatNodesToMove.map((n) => this.findNodeById(n!.id!)).filter((x) => !!x) as N[];

    if (!this.isPossibleToInsert(currentParent.id, ...nodes)) {
      return;
    }

    let siblingIndex = 0;
    if (!isLevelDown) {
      siblingIndex = currentParent.children!.findIndex((sibling) => sibling.id === siblingId);
      if (siblingIndex < 0) {
        siblingIndex = 0;
      }
    }

    const nodeIds = nodes.map((n) => n.id);
    const children = [...currentParent.children!].filter((child) => !nodeIds.includes(child.id));
    children.splice(siblingIndex, 0, ...nodes);
    this._treeNodeUtils.updateChildren(this.originalRoot!, currentParent.id, children as N[], 'replace');

    this.refresh();
  }

  handleDragStart(node: N): void {
    if (this.selectedNodeIds$.value.includes(node.id!)) {
      return;
    }
    this.selectNode(node);
  }

  moveSelectedNodes(direction: 'up' | 'down'): void {
    const parentChildRelations = this.getParentChildRelationsForSelectedNodes();
    if (parentChildRelations.length === 0) {
      return;
    }

    let hasChange = false;

    parentChildRelations.forEach(({ parentId, nodeId }) => {
      const parent = this.findNodeById(parentId);
      const children = (parent?.children || []) as N[];
      const childIndex = children.findIndex((child) => child.id === nodeId);
      let hasLocalChange = false;

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
    const parentId = this.selectedNodeIds$.value[0];
    if (!parentId) {
      return;
    }

    const newNodes = children.map((child) => this._treeNodeUtils.convertItem(child));
    if (!this.isPossibleToInsert(parentId, ...newNodes)) {
      return;
    }

    this._treeNodeUtils.updateChildren(this.originalRoot!, parentId, newNodes, 'append');

    this.refresh();

    if (!this.expansionModel.isSelected(parentId)) {
      this.expansionModel.toggle(parentId);
      const parentFlat = this.treeControl.dataNodes.find((node) => node.id === parentId);
      this.treeControl.expand(parentFlat!);
    }

    const lastChild = newNodes[newNodes.length - 1];
    this.selectedNodeIds$.next([lastChild.id!]);
  }

  removeSelectedNodes(): void {
    const parentChildRelations = this.getParentChildRelationsForSelectedNodes();
    if (parentChildRelations.length === 0) {
      return;
    }

    parentChildRelations.forEach(({ parentId, nodeId }) => {
      const parent = this.findNodeById(parentId)!;
      if (parent) {
        const children = parent.children!.filter((child) => child.id !== nodeId) as N[];
        this._treeNodeUtils.updateChildren(this.originalRoot!, parentId, children, 'replace');
      }
    });

    this.refresh();

    const parents = parentChildRelations
      .map(({ parentId }) => this.findNodeById(parentId))
      .filter((parent) => !!parent);
    const lastParent = parents[parents.length - 1];
    this.selectedNodeIds$.next([lastParent!.id!]);
  }

  findNodeById(id?: string, parent?: N): N | undefined {
    if (!id) {
      return undefined;
    }

    parent = parent || this.rootNode$.value;

    if (parent?.id === id) {
      return parent;
    }

    if (!parent || (parent?.children || []).length === 0) {
      return undefined;
    }

    let result = parent.children!.find((child) => child.id === id);
    if (result) {
      return result as N;
    }

    result = parent.children!.map((child) => this.findNodeById(id, child as N)).find((res) => !!res);

    return result as N;
  }

  toggleNode(nodeId: string): void {
    const checkChildren = !!this._treeNodeUtils.hasChildren && !!this._treeNodeUtils.loadChildren;

    if (checkChildren && this._treeNodeUtils.hasChildren!(nodeId) && !this.expansionModel.isSelected(nodeId)) {
      const node = this.findNodeById(nodeId)!;
      if ((node.children || []).length === 0) {
        this._treeNodeUtils.loadChildren!(node).subscribe(() => {
          this.expansionModel.toggle(nodeId);
          this.refresh();
        });
      }
    } else {
      this.expansionModel.toggle(nodeId);
    }
  }

  expandPath(path: string[]): Observable<boolean> {
    const checkChildren = !!this._treeNodeUtils.hasChildren && !!this._treeNodeUtils.loadChildren;

    const expandChild = (nodeId: string) => {
      if (this.expansionModel.isSelected(nodeId)) {
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
            this.expansionModel.toggle(nodeId);
            this.refresh();
          }),
          map(() => true),
          catchError(() => of(false))
        );
      }

      this.expansionModel.toggle(nodeId);
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
    const ids = this.treeControl.dataNodes.map((node) => node.id!);
    this.expansionModel.select(...ids);
    this.treeControl.dataNodes.forEach((node) => {
      this.treeControl.expand(node);
    });
  }

  collapseAll(): void {
    const ids = this.treeControl.dataNodes.map((node) => node.id!);
    this.expansionModel.deselect(...ids);
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
    this.rootNode$.complete();
    this.selectedNodeIds$.complete();
    this.treeUpdateInternal$.complete();
    this.editNodeIdInternal$.complete();
  }

  private getParentChildRelationsForSelectedNodes(): { nodeId: string; parentId: string }[] {
    const selectedNodeIds = this.selectedNodeIds$.value.filter((nodeId) => nodeId !== this.rootNode$.value?.id);

    const result = selectedNodeIds.map((nodeId) => {
      const flatNode = this.treeControl.dataNodes.find((n) => n.id === nodeId);
      const parentId = flatNode!.parentId!;
      return { nodeId, parentId };
    });

    return result;
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
      addExpandedChildren(node as N, this.expansionModel.selected);
    });
    return result;
  }

  private updateData(nodes: N[]): void {
    this.dataSource.data = nodes;
    this.expansionModel.selected.forEach((id) => {
      const node = this.treeControl.dataNodes.find((node) => node.id === id);
      this.treeControl.expand(node!);
    });
  }

  private determineNewParentToInsert(
    { currentIndex, previousIndex, distance }: InsertPositionData,
    preventCycleParentChoice: boolean = true
  ): {
    parent?: N;
    siblingId?: string;
    isLevelDown: boolean;
  } {
    const visibleNodes = this.getVisibleNodes().map(
      (node) => this.treeControl.dataNodes.find((flatNode) => flatNode.id === node.id)!
    );

    if (currentIndex === previousIndex) {
      currentIndex--;
    }

    const current = visibleNodes[currentIndex];

    let currentParentId = current?.parentId;

    let isLevelDown = false;
    const siblingId = current?.id;

    if (distance.x >= this.paddingIdent) {
      // level down
      currentParentId = current!.id;
      isLevelDown = true;
    }

    if (preventCycleParentChoice) {
      const selectedNodeIds = this.selectedNodeIds$.value.filter((nodeId) => nodeId !== this.rootNode$.value?.id);

      while (selectedNodeIds.includes(currentParentId!)) {
        const node = this.treeControl.dataNodes.find((n) => n.id === currentParentId);
        currentParentId = node?.parentId;
        isLevelDown = false;
      }
    }

    const parent = this.findNodeById(currentParentId);

    return { parent, isLevelDown, siblingId };
  }

  private isPossibleToInsert(newParentId: string, ...itemsToInsert: N[]): boolean {
    // If new parent is a child of itemsToInsert, prevent the insert
    const newParentFoundIn = itemsToInsert
      .map((item) => !!this.findNodeById(newParentId!, item))
      .filter((isFound) => isFound);

    // Allow the insertion, if new parent doesn't exist in items to insert
    return newParentFoundIn.length === 0;
  }

  private refresh(): void {
    const root = this._treeNodeUtils.convertItem(this.originalRoot!);
    this.updateData([root]);
    this.rootNode$.next(root);
    this.treeUpdateInternal$.next(this.originalRoot!);
  }
}
