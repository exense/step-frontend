import {
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  forwardRef,
  inject,
  Input,
  Output,
  TrackByFunction,
  ViewChild,
} from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { TreeActionsService } from '../../services/tree-actions.service';
import { TreeDragDropService } from '../../services/tree-drag-drop.service';
import { TreeStateService } from '../../services/tree-state.service';
import { ArtefactFlatNode } from '../../shared/artefact-flat-node';
import { TreeAction } from '../../shared/tree-action';
import { TreeNode } from '../../shared/tree-node';
import { TreeNodeTemplateDirective } from '../../directives/tree-node-template.directive';
import { TreeNodeTemplateContainerService } from '../../services/tree-node-template-container.service';
import {take} from "rxjs";

@Component({
  selector: 'step-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss'],
  providers: [
    TreeDragDropService,
    {
      provide: TreeNodeTemplateContainerService,
      useExisting: forwardRef(() => TreeComponent),
    },
  ],
})
export class TreeComponent<N extends TreeNode> implements TreeNodeTemplateContainerService {
  private _treeActions = inject(TreeActionsService, { optional: true });

  readonly _treeState = inject<TreeStateService<any, N>>(TreeStateService);
  readonly _treeDragDrop = inject(TreeDragDropService);
  readonly _treeContainer = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly paddingIdent = 24;
  readonly paddingMultiplier = 8;

  readonly trackByAction: TrackByFunction<TreeAction> = (index, item) => item.id;

  readonly contextMenuPosition = { x: 0, y: 0 };

  hasChild = (_: number, node: ArtefactFlatNode) => node.expandable;

  @ViewChild('nodeContextMenuTrigger', { static: true, read: MatMenuTrigger }) contextMenuTrigger!: MatMenuTrigger;

  @ContentChild(TreeNodeTemplateDirective) readonly treeNodeTemplate?: TreeNodeTemplateDirective;

  @Input() dragDisabled: boolean = false;

  @Output() treeContextAction = new EventEmitter<{ actionId: string; node?: N, multipleNodes?: boolean }>();

  @Output() nodeDblClick = new EventEmitter<{ node: N; event: MouseEvent }>();

  protected openedMenuNodeId?: string;

  multipleNodes = false;

  openContextMenu({ event, nodeId }: { event: MouseEvent; nodeId: string }): void {
    this._treeState.selectedNodes$.pipe(take(1)).subscribe(data => this.multipleNodes = data.length > 1);
    const node = this._treeState.findNodeById(nodeId);
    if (!node) {
      return;
    }

    if (!this._treeActions?.hasActionsForNode(node)) {
      return;
    }

    event.preventDefault();
    this.contextMenuPosition.x = event.clientX;
    this.contextMenuPosition.y = event.clientY;
    this.contextMenuTrigger.menuData = { node };
    this.contextMenuTrigger.openMenu();
    this.openedMenuNodeId = nodeId;
  }

  handleContextAction(action: TreeAction, node?: N): void {
    const actionId = action.id;
    this.treeContextAction.emit({ actionId, node, multipleNodes: this.multipleNodes });
  }

  handleDblClick(node: N, event: MouseEvent): void {
    this.nodeDblClick.emit({ node, event });
  }

  handleContextClose(): void {
    this.openedMenuNodeId = undefined;
  }
}
