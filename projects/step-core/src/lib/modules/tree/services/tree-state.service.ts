import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, map, Observable, combineLatest } from 'rxjs';
import { AbstractArtefact } from '../../../client/generated';
import { FlatTreeControl } from '@angular/cdk/tree';
import { ArtefactFlatNode } from '../shared/artefact-flat-node';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { AbstractArtefactWithParentId } from '../shared/abstract-artefact-with-parent-id';
import { SelectionModel } from '@angular/cdk/collections';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

const unique = <T>(item: T, index: number, self: T[]) => self.indexOf(item) === index;

@Injectable()
export class TreeStateService implements OnDestroy {
  readonly paddingIdent = 30;

  private rootNode$ = new BehaviorSubject<AbstractArtefact | undefined>(undefined);
  private selectedNodeIds$ = new BehaviorSubject<string[]>([]);

  readonly selectedArtefact$ = this.selectedNodeIds$.pipe(map((nodeIds) => this.findNodeById(nodeIds[0])));

  readonly selectedNodes$ = combineLatest([this.selectedNodeIds$, this.rootNode$]).pipe(
    map(([nodes, root]) => {
      const selectedNodeIds = nodes.filter((nodeId) => nodeId !== root?.id);
      return selectedNodeIds.map((nodeId) => this.treeControl.dataNodes.find((n) => n.id === nodeId)!);
    })
  );

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

  init(rootNode: AbstractArtefact, selectedNodeIds: string[]): void {
    this.rootNode$.next(rootNode);
    this.selectedNodeIds$.next(selectedNodeIds);
    this.updateData([rootNode]);
    this.expandAll();
  }

  isNodeSelected(nodeId: string): Observable<boolean> {
    return this.selectedNodeIds$.pipe(map((nodes) => nodes.includes(nodeId)));
  }

  isRoot(nodeId: string): Observable<boolean> {
    return this.rootNode$.pipe(map((rootNode) => rootNode?.id === nodeId));
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

  handleDrop({ currentIndex, previousIndex, distance }: CdkDragDrop<any>): void {
    const selectedNodeIds = this.selectedNodeIds$.value.filter((nodeId) => nodeId !== this.rootNode$.value?.id);
    const flatNodesToMove = selectedNodeIds.map((nodeId) => this.treeControl.dataNodes.find((n) => n.id === nodeId));

    if (flatNodesToMove.length === 0) {
      return;
    }

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

    while (selectedNodeIds.includes(currentParentId!)) {
      const node = this.treeControl.dataNodes.find((n) => n.id === currentParentId);
      currentParentId = node?.parentId;
      isLevelDown = false;
    }

    const currentParent = this.findNodeById(currentParentId);

    if (!currentParent) {
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
    const artefacts = flatNodesToMove.map((n) => this.findNodeById(n!.id!)).filter((x) => !!x) as AbstractArtefact[];

    parents.forEach((parent) => {
      parent.children = parent.children!.filter((x) => !artefacts.includes(x));
    });

    currentParent.children!.splice(siblingIndex, 0, ...artefacts);

    this.updateData([this.rootNode$.value!]);
    this.rootNode$.next(this.rootNode$.value);
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

      if (direction === 'down' && childIndex < children.length - 2) {
        const sibling = children[childIndex + 1];
        children[childIndex + 1] = children[childIndex];
        children[childIndex] = sibling;
        hasChange = true;
      }
    });

    if (hasChange) {
      this.updateData([this.rootNode$.value!]);
      this.rootNode$.next(this.rootNode$.value);
    }
  }

  removeSelectedNodes(): void {
    const parentChildRelations = this.getParentChildRelationsForSelectedNodes();
    if (parentChildRelations.length === 0) {
      return;
    }

    parentChildRelations.forEach(({ parentId, nodeId }) => {
      const parent = this.findNodeById(parentId)!;
      parent.children = parent.children!.filter((child) => child.id !== nodeId);
    });

    this.updateData([this.rootNode$.value!]);
    this.rootNode$.next(this.rootNode$.value);
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

  ngOnDestroy(): void {
    this.rootNode$.complete();
    this.selectedNodeIds$.complete();
  }
}
