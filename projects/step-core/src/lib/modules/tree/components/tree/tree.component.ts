import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
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
import { TreeActionsService } from '../../services/tree-actions.service';
import { TreeDragDropService } from '../../services/tree-drag-drop.service';
import { TreeStateService } from '../../services/tree-state.service';
import { TreeAction } from '../../shared/tree-action';
import { TreeNode } from '../../shared/tree-node';
import { CdkTree } from '@angular/cdk/tree';
import { TreeFlatNode } from '../../shared/tree-flat-node';
import { Subject, switchMap, takeUntil, timer, combineLatest } from 'rxjs';
import { NodeElementRefDirective } from '../../directives/node-element-ref.directive';

@Component({
  selector: 'step-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss'],
  providers: [TreeDragDropService],
})
export class TreeComponent<N extends TreeNode> implements AfterViewInit, OnDestroy {
  private terminator$ = new Subject<void>();

  readonly paddingIdent = 24;
  readonly paddingMultiplier = 8;

  readonly _treeState = inject<TreeStateService<any, N>>(TreeStateService);
  readonly _treeDragDrop = inject(TreeDragDropService);
  public _treeContainer = inject<ElementRef<HTMLElement>>(ElementRef);
  private _treeActions? = inject(TreeActionsService, { optional: true });

  readonly trackByAction: TrackByFunction<TreeAction> = (index, item) => item.id;

  readonly contextMenuPosition = { x: 0, y: 0 };

  protected lastVisibleNode?: TreeFlatNode;

  hasChild = (_: number, node: TreeFlatNode) => node.expandable;

  @ViewChild('nodeContextMenuTrigger', { static: true, read: MatMenuTrigger }) contextMenuTrigger!: MatMenuTrigger;

  @ViewChild(CdkTree, { read: ElementRef }) private treeElement!: ElementRef<HTMLElement>;
  @ViewChildren(NodeElementRefDirective) private visibleNodes!: QueryList<NodeElementRefDirective>;

  @Input() dragDisabled: boolean = false;

  @Output() treeContextAction = new EventEmitter<{ actionId: string; node?: N }>();

  @Output() nodeDblClick = new EventEmitter<{ node: N; event: MouseEvent }>();

  ngAfterViewInit(): void {
    this.determineLastVisibleNode();
    combineLatest([this._treeState.treeUpdate$, this._treeState.expandModelChange$])
      .pipe(
        switchMap(() => timer(300)),
        takeUntil(this.terminator$)
      )
      .subscribe(() => this.determineLastVisibleNode());
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

  private determineLastVisibleNode(): void {
    const size = this.treeElement.nativeElement.children.length;
    const lastElement = this.treeElement.nativeElement.children.item(size - 1);
    const treeNode = this.visibleNodes.find((nodeRef) => nodeRef._element === lastElement);
    this.lastVisibleNode = treeNode?.node;
  }
}
