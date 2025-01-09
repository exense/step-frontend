import {
  Component,
  contentChild,
  effect,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostBinding,
  HostListener,
  inject,
  input,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { TreeActionsService } from '../../services/tree-actions.service';
import { TreeStateService } from '../../services/tree-state.service';
import { TreeAction } from '../../types/tree-action';
import { TreeNode } from '../../types/tree-node';
import { TreeNodeTemplateDirective } from '../../directives/tree-node-template.directive';
import { TreeNodeTemplateContainerService } from '../../services/tree-node-template-container.service';
import { DragDataService } from '../../../drag-drop';
import { TreeFlatNode } from '../../types/tree-flat-node';
import { TreeFocusStateService } from '../../services/tree-focus-state.service';
import { AsyncPipe, DOCUMENT, NgTemplateOutlet } from '@angular/common';
import { TreeNodeDetailsTemplateDirective } from '../../directives/tree-node-details-template.directive';
import { TreeNodeNameTemplateDirective } from '../../directives/tree-node-name-template.directive';
import { TreeNodeComponent } from '../tree-node/tree-node.component';
import { TreeNodeActionsPipe } from '../../pipes/tree-node-actions.pipe';
import { StepMaterialModule } from '../../../step-material/step-material.module';

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
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [StepMaterialModule, TreeNodeComponent, TreeNodeActionsPipe, AsyncPipe, NgTemplateOutlet],
})
export class TreeComponent<N extends TreeNode> implements TreeNodeTemplateContainerService {
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
  readonly treeNodeNameTemplate = contentChild(TreeNodeNameTemplateDirective);
  readonly treeNodeDetailsTemplate = contentChild(TreeNodeDetailsTemplateDirective);

  @Input() dragDisabled: boolean = false;

  /** @Input() **/
  readonly forceFocus = input<boolean>(false);

  @Output() treeContextAction = new EventEmitter<{ actionId: string; node?: N; multipleNodes?: boolean }>();

  @Output() nodeDblClick = new EventEmitter<{ node: N | TreeNode; event: MouseEvent }>();

  openedMenuNodeId?: string;

  private forceFocusChange = effect(() => {
    if (this.forceFocus()) {
      this.setFocus(true);
    }
  });

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
