import { Component, EventEmitter, Input, Output, SimpleChanges, TrackByFunction, ViewChild } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { MatMenuTrigger } from '@angular/material/menu';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { STEP_CORE_JS } from '../../../../angularjs';
import { AbstractArtefact } from '../../../../client/generated';
import { AbstractArtefactWithParentId } from '../../shared/abstract-artefact-with-parent-id';
import { TreeAction } from '../../shared/tree-action';
import { ArtefactFlatNode } from '../../shared/artefact-flat-node';

@Component({
  selector: 'step-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss'],
  exportAs: 'StepTree',
})
export class TreeComponent {
  readonly paddingIdent = 30;

  readonly trackByAction: TrackByFunction<TreeAction> = (index, item) => item.id;

  readonly contextMenuPosition = { x: 0, y: 0 };

  treeControl = new FlatTreeControl<ArtefactFlatNode>(
    (node) => node.level,
    (node) => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
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

  dataSource = new MatTreeFlatDataSource<AbstractArtefact, ArtefactFlatNode>(this.treeControl, this.treeFlattener);

  expansionModel = new SelectionModel<string>(true);

  hasChild = (_: number, node: ArtefactFlatNode) => node.expandable;

  @ViewChild('nodeContextMenuTrigger', { static: true, read: MatMenuTrigger }) contextMenuTrigger!: MatMenuTrigger;

  @Input() rootNode?: AbstractArtefact;
  @Output() rootNodeChange = new EventEmitter<AbstractArtefact | undefined>();

  @Input() dragDisabled: boolean = false;

  @Input() selectedNodeId?: string;
  @Output() selectedNodeIdChange = new EventEmitter<string | undefined>();

  @Input() actions: TreeAction[] = [];
  @Output() treeContextAction = new EventEmitter<{ actionId: string; node?: AbstractArtefact }>();

  ngOnChanges(changes: SimpleChanges): void {
    const cRootNode = changes['rootNode'];
    if (cRootNode?.previousValue !== cRootNode?.currentValue || cRootNode?.firstChange) {
      this.dataSource.data = cRootNode?.currentValue ? [cRootNode?.currentValue] : [];
      this.expandAll();
    }
  }

  selectNode(node: ArtefactFlatNode): void {
    this.selectedNodeId = node.id;
    this.selectedNodeIdChange.emit(this.selectedNodeId);
  }

  drop(event: CdkDragDrop<any>): void {
    const { previousIndex, currentIndex } = event;
    const visibleNodes = this.getVisibleNodes().map(
      (node) => this.treeControl.dataNodes.find((flatNode) => flatNode.id === node.id)!
    );

    const previous = visibleNodes[previousIndex];
    const current = visibleNodes[currentIndex];

    const id = previous.id;
    const previousParentId = previous?.parentId;
    let currentParentId = current?.parentId;

    let isLevelDown = false;
    const siblingId = current?.id;

    if (event.distance.x >= this.paddingIdent) {
      // level down
      currentParentId = current!.id;
      isLevelDown = true;
    }

    if (!currentParentId || !previousParentId) {
      return;
    }

    const previousParent = this.findNodeById(previousParentId);
    const currentParent = this.findNodeById(currentParentId);

    if (!previousParent || !currentParent) {
      return;
    }

    const artefact = previousParent.children!.find((x) => x.id === id);

    if (!artefact) {
      return;
    }

    let siblingIndex = 0;
    if (!isLevelDown) {
      siblingIndex = currentParent.children!.findIndex((sibling) => sibling.id === siblingId);
      if (siblingIndex < 0) {
        siblingIndex = 0;
      }
    }

    previousParent.children = previousParent.children!.filter((x) => x !== artefact);
    currentParent.children!.splice(siblingIndex, 0, artefact);
    this.updateData([this.rootNode!]);
    this.rootNodeChange.emit(this.rootNode);
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

  openContextMenu(event: MouseEvent, nodeId: string): void {
    if (!this.actions?.length) {
      return;
    }

    event.preventDefault();
    this.contextMenuPosition.x = event.clientX;
    this.contextMenuPosition.y = event.clientY;
    this.contextMenuTrigger.menuData = { node: this.findNodeById(nodeId) };
    this.contextMenuTrigger.openMenu();
  }

  handleContextAction(action: TreeAction, node?: AbstractArtefact): void {
    const actionId = action.id;
    this.treeContextAction.emit({ actionId, node });
  }

  private findNodeById(id: string, parent?: AbstractArtefact): AbstractArtefact | undefined {
    parent = parent || this.rootNode;

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
}

getAngularJSGlobal()
  .module(STEP_CORE_JS)
  .directive('stepTree', downgradeComponent({ component: TreeComponent }));
