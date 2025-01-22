import {
  AfterViewInit,
  Component,
  contentChild,
  DestroyRef,
  effect,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostBinding,
  HostListener,
  inject,
  input,
  Input,
  output,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { TreeActionsService } from '../../services/tree-actions.service';
import { TreeStateService } from '../../services/tree-state.service';
import { TreeAction } from '../../shared/tree-action';
import { TreeNode } from '../../shared/tree-node';
import { TreeNodeTemplateDirective } from '../../directives/tree-node-template.directive';
import { TreeNodeTemplateContainerService } from '../../services/tree-node-template-container.service';
import { DragDataService, DropInfo } from '../../../drag-drop';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TreeFlatNode } from '../../shared/tree-flat-node';
import { TreeFocusStateService } from '../../services/tree-focus-state.service';
import { DOCUMENT } from '@angular/common';
import { TreeNodeDetailsTemplateDirective } from '../../directives/tree-node-details-template.directive';
import { DragEndType } from '../../../drag-drop/types/drag-end-type.enum';

@Component({
  selector: 'step-tree',
  templateUrl: './tree.component.html',
  styleUrl: './tree.component.scss',
  providers: [
    {
      provide: TreeNodeTemplateContainerService,
      useExisting: forwardRef(() => TreeComponent),
    },
  ],
  encapsulation: ViewEncapsulation.None,
})
export class TreeComponent<N extends TreeNode> implements AfterViewInit, TreeNodeTemplateContainerService {
  private _destroyRef = inject(DestroyRef);
  private _treeActions = inject(TreeActionsService, { optional: true });
  private _treeFocusState = inject(TreeFocusStateService, { optional: true });
  private _elRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private _doc = inject(DOCUMENT);

  readonly _treeState = inject<TreeStateService<any, N>>(TreeStateService);

  readonly contextMenuPosition = { x: 0, y: 0 };

  @HostBinding('class.in-focus')
  private isTreeInFocus = false;

  @ViewChild(DragDataService, { static: true }) private dragData!: DragDataService;

  @ViewChild('nodeContextMenuTrigger', { static: true, read: MatMenuTrigger }) contextMenuTrigger!: MatMenuTrigger;

  readonly treeNodeTemplate = contentChild(TreeNodeTemplateDirective);
  readonly treeNodeDetailsTemplate = contentChild(TreeNodeDetailsTemplateDirective);

  @Input() dragDisabled: boolean = false;

  /** @Input() **/
  readonly forceFocus = input<boolean>(false);

  @Output() treeContextAction = new EventEmitter<{ actionId: string; node?: N; multipleNodes?: boolean }>();

  @Output() nodeDblClick = new EventEmitter<{ node: N | TreeNode; event: MouseEvent }>();

  /** @Output() **/
  readonly externalObjectDrop = output<DropInfo>();

  protected openedMenuNodeId?: string;

  private forceFocusChange = effect(() => {
    if (this.forceFocus()) {
      this.setFocus(true);
    }
  });

  ngAfterViewInit(): void {
    this.dragData.dragData$
      .pipe(
        filter((dragItemId) => !!dragItemId && typeof dragItemId === 'string'),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe((dragItemId) => this._treeState.selectNode(dragItemId as string, undefined, true));
    this.dragData.dragEnd$
      .pipe(
        filter((dragEndType) => dragEndType === DragEndType.STOP),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe(() => this._treeState.notifyInsertionComplete?.());
  }

  openContextMenu({ event, nodeId }: { event: MouseEvent; nodeId: string }): void {
    const node = this._treeState.findNodeById(nodeId);
    const nodes = this._treeState.getSelectedNodes();
    const multipleNodes = nodes.length > 1 && !!nodes.find((el) => el.id === nodeId);
    if (!node) {
      return;
    }

    if (!this._treeActions?.hasActionsForNode(node)) {
      return;
    }

    event.preventDefault();
    this.contextMenuPosition.x = event.clientX;
    this.contextMenuPosition.y = event.clientY;
    this.contextMenuTrigger.menuData = { node, multipleNodes };
    this.contextMenuTrigger.openMenu();
    this.openedMenuNodeId = nodeId;
  }

  handleContextAction(action: TreeAction, node?: N): void {
    const actionId = action.id;
    const multipleNodes = this.contextMenuTrigger.menuData.multipleNodes;
    this.treeContextAction.emit({ actionId, node, multipleNodes });
  }

  handleDblClick(flatNode: TreeFlatNode, event: MouseEvent): void {
    const node = this._treeState.findNodeById(flatNode.id)!;
    this.nodeDblClick.emit({ node, event });
  }

  handleContextClose(): void {
    this.openedMenuNodeId = undefined;
  }

  handleDragOver(event: DropInfo): void {
    if (!this._treeState.rootNodeId()) {
      return;
    }
    const isTreeNode = typeof event.draggedElement === 'string';
    const newParentId = (event.droppedArea ?? this._treeState.rootNodeId()) as string;
    if (isTreeNode && !this._treeState.canInsertTo(newParentId)) {
      return;
    }
    this._treeState.notifyPotentialInsert?.(newParentId);
  }

  handleDropNode(event: DropInfo): void {
    if (!this._treeState.rootNodeId()) {
      this._treeState.notifyInsertionComplete?.();
      return;
    }
    const newParentId = (event.droppedArea ?? this._treeState.rootNodeId()) as string;
    const dropAdditionalInfo = event.additionalInfo as string | undefined;

    const isTreeNode = typeof event.draggedElement === 'string';
    if (!isTreeNode) {
      this.externalObjectDrop.emit(event);
      return;
    }

    if (!this._treeState.canInsertTo(newParentId)) {
      this._treeState.notifyInsertionComplete?.();
      return;
    }

    if (!dropAdditionalInfo) {
      this._treeState.insertSelectedNodesTo(newParentId);
    } else if (dropAdditionalInfo === 'first') {
      this._treeState.insertSelectedNodesTo(newParentId, { insertAtFirstPosition: true });
    } else {
      const insertAfterSiblingId = dropAdditionalInfo as string;
      this._treeState.insertSelectedNodesTo(newParentId, { insertAfterSiblingId });
    }
    this._treeState.notifyInsertionComplete?.();
  }

  private setFocus(isInFocus: boolean) {
    this.isTreeInFocus = isInFocus;
    this._treeFocusState?.setTreeFocus(isInFocus);
  }

  @HostListener('document:click', ['$event'])
  private handleGlobalClick(event: MouseEvent): void {
    const isInFocus = this.forceFocus() || this._elRef.nativeElement.contains(event.target as Node);
    this.setFocus(isInFocus);
  }

  @HostListener('document:keyup', ['$event'])
  private handleTab(event: KeyboardEvent): void {
    if (event.key !== 'Tab' || this.forceFocus()) {
      return;
    }
    const isInFocus = this._elRef.nativeElement.contains(this._doc.activeElement);
    this.setFocus(isInFocus);
  }
}
