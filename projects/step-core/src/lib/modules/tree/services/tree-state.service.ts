import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, map, Observable, combineLatest, Subject } from 'rxjs';
import { AbstractArtefact } from '../../../client/generated';
import { FlatTreeControl } from '@angular/cdk/tree';
import { ArtefactFlatNode } from '../shared/artefact-flat-node';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { AbstractArtefactWithParentId } from '../shared/abstract-artefact-with-parent-id';
import { SelectionModel } from '@angular/cdk/collections';
import { InsertPositionData } from '../shared/insert-position-data';

const unique = <T>(item: T, index: number, self: T[]) => self.indexOf(item) === index;

@Injectable()
export class TreeStateService implements OnDestroy {
  readonly paddingIdent = 15;
  readonly treeControl = new FlatTreeControl<ArtefactFlatNode>(
    (node) => node.level,
    (node) => node.expandable
  );
  readonly treeFlattener = new MatTreeFlattener(
    (node: AbstractArtefactWithParentId, level: number) =>
      ({
        id: node.id,
        name: node?.attributes?.['name'] || '',
        _class: node._class,
        level,
        expandable: (node.children?.length ?? -1) > 0,
        parentId: node.parentId,
        isSkipped: !!node.skipNode?.value,
      } as ArtefactFlatNode),
    (node) => node.level,
    (node) => node.expandable,
    (node) => {
      const parentId = node.id;
      return (node?.children || []).map((child) => ({ ...child, parentId }));
    }
  );
  readonly dataSource = new MatTreeFlatDataSource<AbstractArtefact, ArtefactFlatNode>(
    this.treeControl,
    this.treeFlattener
  );
  readonly expansionModel = new SelectionModel<string>(true);
  private rootNode$ = new BehaviorSubject<AbstractArtefact | undefined>(undefined);
  private selectedNodeIds$ = new BehaviorSubject<string[]>([]);
  readonly selectedArtefact$ = this.selectedNodeIds$.pipe(map((nodeIds) => this.findNodeById(nodeIds[0])));

  readonly selectedNodes$ = combineLatest([this.selectedNodeIds$, this.rootNode$]).pipe(
    map(([nodes, root]) => {
      const selectedNodeIds = nodes.filter((nodeId) => nodeId !== root?.id);
      return selectedNodeIds.map((nodeId) => this.treeControl.dataNodes.find((n) => n.id === nodeId)!);
    })
  );
  private editNodeIdInternal$ = new BehaviorSubject<string | undefined>(undefined);
  readonly editNodeId$ = this.editNodeIdInternal$.asObservable();
  private treeUpdateInternal$ = new Subject<AbstractArtefact>();
  readonly treeUpdate$ = this.treeUpdateInternal$.asObservable();

  init(rootNode: AbstractArtefact, selectedNodeIds?: string[]): void {
    this.rootNode$.next(rootNode);
    if (selectedNodeIds) {
      this.selectedNodeIds$.next(selectedNodeIds);
    } else {
      this.selectedNodeIds$.next([...this.selectedNodeIds$.value]);
    }
    this.updateData([rootNode]);
    this.expandAll();
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
    const node = this.findNodeById(editNodeId);
    if (node) {
      node.attributes = node.attributes || {};
      node.attributes['name'] = name;
      if (this.selectedNodeIds$.value.includes(editNodeId)) {
        this.selectedNodeIds$.next([editNodeId]);
      }
      this.updateData([this.rootNode$.value!]);
      this.rootNode$.next(this.rootNode$.value);
      this.treeUpdateInternal$.next(this.rootNode$.value!);
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
    node.skipNode = node.skipNode || {};
    node.skipNode.value = !node.skipNode.value;
    this.updateData([this.rootNode$.value!]);
    this.rootNode$.next(this.rootNode$.value);
    this.treeUpdateInternal$.next(this.rootNode$.value!);
  }

  selectNode(node: ArtefactFlatNode, $event?: MouseEvent): void {
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
      .filter((x) => !!x) as AbstractArtefact[];

    if (artefacts.length === 0) {
      return false;
    }

    const { parent } = this.determineNewParentToInsert(insertPositionData, false);
    if (!parent) {
      return false;
    }

    return this.isPossibleToInsert(parent, ...artefacts);
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

    const artefacts = flatNodesToMove.map((n) => this.findNodeById(n!.id!)).filter((x) => !!x) as AbstractArtefact[];

    if (!this.isPossibleToInsert(currentParent, ...artefacts)) {
      return;
    }

    let siblingIndex = 0;
    if (!isLevelDown) {
      siblingIndex = currentParent.children!.findIndex((sibling) => sibling.id === siblingId);
      if (siblingIndex < 0) {
        siblingIndex = 0;
      }
    }

    const parents = flatNodesToMove
      .map((n) => this.findNodeById(n!.parentId!))
      .filter((x) => !!x) as AbstractArtefact[];

    parents.forEach((parent) => {
      parent.children = parent.children!.filter((x) => !artefacts.includes(x));
    });

    currentParent.children!.splice(siblingIndex, 0, ...artefacts);

    this.updateData([this.rootNode$.value!]);
    this.rootNode$.next(this.rootNode$.value);
    this.treeUpdateInternal$.next(this.rootNode$.value!);
  }

  handleDragStart(node: ArtefactFlatNode): void {
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
      const children = parent?.children || [];
      const childIndex = children.findIndex((child) => child.id === nodeId);

      if (direction === 'up' && childIndex > 0) {
        const sibling = children[childIndex - 1];
        children[childIndex - 1] = children[childIndex];
        children[childIndex] = sibling;
        hasChange = true;
      }

      if (direction === 'down' && childIndex < children.length - 1) {
        const sibling = children[childIndex + 1];
        children[childIndex + 1] = children[childIndex];
        children[childIndex] = sibling;
        hasChange = true;
      }
    });

    if (hasChange) {
      this.updateData([this.rootNode$.value!]);
      this.rootNode$.next(this.rootNode$.value);
      this.treeUpdateInternal$.next(this.rootNode$.value!);
    }
  }

  addChildrenToSelectedNode(...children: AbstractArtefact[]): void {
    const parent = this.findNodeById(this.selectedNodeIds$.value[0]);
    if (!parent) {
      return;
    }

    if (!this.isPossibleToInsert(parent, ...children)) {
      return;
    }

    parent.children = parent.children || [];
    parent.children.push(...children);

    this.updateData([this.rootNode$.value!]);
    this.rootNode$.next(this.rootNode$.value);
    this.treeUpdateInternal$.next(this.rootNode$.value!);

    if (!this.expansionModel.isSelected(parent.id!)) {
      this.expansionModel.toggle(parent.id!);
      const parentFlat = this.treeControl.dataNodes.find((node) => node.id === parent.id!);
      this.treeControl.expand(parentFlat!);
    }

    const lastChild = children[children.length - 1];
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
        parent.children = parent.children!.filter((child) => child.id !== nodeId);
      }
    });

    this.updateData([this.rootNode$.value!]);
    this.rootNode$.next(this.rootNode$.value);
    this.treeUpdateInternal$.next(this.rootNode$.value!);

    const parents = parentChildRelations
      .map(({ parentId }) => this.findNodeById(parentId))
      .filter((parent) => !!parent);
    const lastParent = parents[parents.length - 1];
    this.selectedNodeIds$.next([lastParent!.id!]);
  }

  findNodeById(id?: string, parent?: AbstractArtefact): AbstractArtefact | undefined {
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
      return result;
    }

    result = parent.children!.map((child) => this.findNodeById(id, child)).find((res) => !!res);

    return result;
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

  getSelectedArtefacts(): AbstractArtefact[] {
    const ids = this.selectedNodeIds$.value;

    const result = ids.map((id) => this.findNodeById(id)).filter((x) => !!x) as AbstractArtefact[];

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

  private getVisibleNodes(): AbstractArtefact[] {
    const result: AbstractArtefact[] = [];
    const addExpandedChildren = (node: AbstractArtefact, expanded: string[]) => {
      result.push(node);
      if (expanded.includes(node.id!)) {
        node.children!.map((child) => addExpandedChildren(child, expanded));
      }
    };
    this.dataSource.data.forEach((node) => {
      addExpandedChildren(node, this.expansionModel.selected);
    });
    return result;
  }

  private updateData(nodes: AbstractArtefact[]): void {
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
    parent?: AbstractArtefact;
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

  private isPossibleToInsert(newParent: AbstractArtefact, ...itemsToInsert: AbstractArtefact[]): boolean {
    // If new parent is a child of itemsToInsert, prevent the insert
    const newParentFoundIn = itemsToInsert
      .map((item) => !!this.findNodeById(newParent.id!, item))
      .filter((isFound) => isFound);

    // Allow the insertion, if new parent doesn't exist in items to insert
    return newParentFoundIn.length === 0;
  }
}
