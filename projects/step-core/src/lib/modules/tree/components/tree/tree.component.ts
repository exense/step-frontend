import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  inject,
  Input,
  OnDestroy,
  Output,
  QueryList,
  TrackByFunction,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { CdkTree } from '@angular/cdk/tree';
import { Subject, switchMap, takeUntil, timer, combineLatest } from 'rxjs';
import { TreeActionsService } from '../../services/tree-actions.service';
import { TreeDragDropService } from '../../services/tree-drag-drop.service';
import { TreeStateService } from '../../services/tree-state.service';
import { TreeAction } from '../../shared/tree-action';
import { TreeNode } from '../../shared/tree-node';
import { TreeFlatNode } from '../../shared/tree-flat-node';
import { NodeElementRefDirective } from '../../directives/node-element-ref.directive';
import { LastVisibleNodeInfo } from '../../shared/last-visible-node-info';
import { LastNodeContainerService } from '../../services/last-node-container.service';

@Component({
  selector: 'step-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss'],
  providers: [
    {
      provide: LastNodeContainerService,
      useValue: forwardRef(() => TreeComponent),
    },
    TreeDragDropService,
  ],
})
export class TreeComponent<N extends TreeNode> implements AfterViewInit, OnDestroy, LastNodeContainerService {
  private terminator$ = new Subject<void>();

  readonly paddingIdent = 24;
  readonly paddingMultiplier = 8;

  readonly _treeState = inject<TreeStateService<any, N>>(TreeStateService);
  readonly _treeDragDrop = inject(TreeDragDropService);
  public _treeContainer = inject<ElementRef<HTMLElement>>(ElementRef);
  private _treeActions? = inject(TreeActionsService, { optional: true });

  readonly trackByAction: TrackByFunction<TreeAction> = (index, item) => item.id;

  readonly contextMenuPosition = { x: 0, y: 0 };

  protected bottomInfo: LastVisibleNodeInfo[] = [];
  lastNode?: TreeFlatNode;

  hasChild = (_: number, node: TreeFlatNode) => node.expandable;

  @ViewChild('nodeContextMenuTrigger', { static: true, read: MatMenuTrigger }) contextMenuTrigger!: MatMenuTrigger;

  @ViewChild(CdkTree, { read: ElementRef }) private treeElement!: ElementRef<HTMLElement>;
  @ViewChildren(NodeElementRefDirective) private visibleNodes!: QueryList<NodeElementRefDirective>;

  @Input() dragDisabled: boolean = false;

  @Output() treeContextAction = new EventEmitter<{ actionId: string; node?: N }>();

  @Output() nodeDblClick = new EventEmitter<{ node: N; event: MouseEvent }>();

  ngAfterViewInit(): void {
    this.setupBottomInfoCalculation();
  }

  ngOnDestroy(): void {
    this.terminator$.next();
    this.terminator$.complete();
  }

  openContextMenu({ event, nodeId }: { event: MouseEvent; nodeId: string }): void {
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
  }

  handleContextAction(action: TreeAction, node?: N): void {
    const actionId = action.id;
    this.treeContextAction.emit({ actionId, node });
  }

  handleDblClick(node: N, event: MouseEvent): void {
    this.nodeDblClick.emit({ node, event });
  }

  private setupBottomInfoCalculation(): void {
    if (this.dragDisabled) {
      return;
    }
    this.determineBottomInfo();
    combineLatest([this._treeState.treeUpdate$, this._treeState.expandModelChange$])
      .pipe(
        switchMap(() => timer(300)),
        takeUntil(this.terminator$)
      )
      .subscribe(() => this.determineBottomInfo());
  }

  private determineBottomInfo(): void {
    const size = this.treeElement.nativeElement.children.length;
    const lastElement = this.treeElement.nativeElement.children.item(size - 1);
    const lastNode = this.visibleNodes.find((nodeRef) => nodeRef._element === lastElement);
    if (!lastNode?.node) {
      this.lastNode = undefined;
      this.bottomInfo = [];
      return;
    }
    this.lastNode = lastNode.node;

    const path = this._treeState.getNodePath(lastNode.node as unknown as N);
    this.bottomInfo = path
      .map((nodeId) => this.visibleNodes.find((ref) => ref.node.id === nodeId))
      .filter((ref) => !!ref?.node?.parentId)
      .map((ref) => {
        const nodeId = ref?.node?.parentId ?? '';
        const leftOffset = ref?.contentElement?.offsetLeft ?? 0;
        return { nodeId, leftOffset };
      });
  }
}
