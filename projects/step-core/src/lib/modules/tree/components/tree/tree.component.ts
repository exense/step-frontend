import {
  AfterViewInit,
  Component,
  ContentChild,
  DestroyRef,
  EventEmitter,
  forwardRef,
  inject,
  Input,
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

  readonly _treeState = inject<TreeStateService<any, N>>(TreeStateService);

  readonly contextMenuPosition = { x: 0, y: 0 };

  @ViewChild(DragDataService, { static: true }) private dragData!: DragDataService;

  @ViewChild('nodeContextMenuTrigger', { static: true, read: MatMenuTrigger }) contextMenuTrigger!: MatMenuTrigger;

  @ContentChild(TreeNodeTemplateDirective) readonly treeNodeTemplate?: TreeNodeTemplateDirective;

  @Input() dragDisabled: boolean = false;

  @Output() treeContextAction = new EventEmitter<{ actionId: string; node?: N; multipleNodes?: boolean }>();

  @Output() nodeDblClick = new EventEmitter<{ node: N | TreeNode; event: MouseEvent }>();

  protected openedMenuNodeId?: string;

  ngAfterViewInit(): void {
    this.dragData.dragData$
      .pipe(
        filter((dragItemId) => !!dragItemId),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe((dragItemId) => this._treeState.selectNode(dragItemId as string, undefined, true));
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

  handleDropNode(event: DropInfo): void {
    if (!this._treeState.rootNodeId()) {
      return;
    }
    const newParentId = (event.droppedArea ?? this._treeState.rootNodeId()) as string;
    const dropAdditionalInfo = event.additionalInfo as string | undefined;

    if (!this._treeState.canInsertTo(newParentId)) {
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
  }
}
