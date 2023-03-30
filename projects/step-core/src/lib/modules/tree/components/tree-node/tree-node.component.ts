import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { TreeNode } from '../../shared/tree-node';
import { TreeStateService } from '../../services/tree-state.service';
import { TreeDragDropService } from '../../services/tree-drag-drop.service';
import { TreeFlatNode } from '../../shared/tree-flat-node';
import { CdkDragEnter, CdkDragStart } from '@angular/cdk/drag-drop';
import { Observable, of, Subject, takeUntil } from 'rxjs';
import { DropInfo } from '../../shared/drop-info';

const ICON_EXPANDED = 'chevron-down';
const ICON_COLLAPSED = 'chevron-right';

@Component({
  selector: 'step-tree-node',
  templateUrl: './tree-node.component.html',
  styleUrls: ['./tree-node.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TreeNodeComponent implements OnInit, OnChanges, OnDestroy {
  private terminator$ = new Subject<void>();
  private isExpanded: boolean = false;

  @Input() canToggle: boolean = false;
  @Input() node!: TreeFlatNode;
  @Input() dragDisabled: boolean = false;
  @Input() treeContainer!: ElementRef<HTMLElement>;
  @Output() contextMenu = new EventEmitter<{ event: MouseEvent; nodeId: string }>();

  protected dropInfo$: Observable<DropInfo | undefined> = of(undefined);
  protected toggleStateIcon: string = ICON_COLLAPSED;

  constructor(private _treeState: TreeStateService<any, TreeNode>, private _treeDragDrop: TreeDragDropService) {}

  toggle(): void {
    this._treeState.toggleNode(this.node.id);
  }

  dragStart(event: CdkDragStart<any>): void {
    this.dropInfo$ = this._treeDragDrop.onDragStart(event);
    this._treeState.selectNode(this.node, undefined, true);
  }

  dragEnter(event: CdkDragEnter<any>): void {
    this._treeDragDrop.onEnter(event);
  }

  dragEnd(): void {
    this._treeDragDrop.onDragEnd();
  }

  openContextMenu(event: MouseEvent): void {
    const nodeId = this.node.id;
    this.contextMenu.emit({ event, nodeId });
  }

  ngOnInit(): void {
    this._treeState.treeControl.expansionModel.changed
      .pipe(takeUntil(this.terminator$))
      .subscribe(() => this.updateExpandedFlag());
  }

  ngOnDestroy(): void {
    this.terminator$.next();
    this.terminator$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cNode = changes['node'];
    if (cNode?.currentValue !== cNode?.previousValue && cNode?.firstChange) {
      this.updateExpandedFlag(cNode?.currentValue);
    }
  }

  private updateExpandedFlag(node?: TreeFlatNode): void {
    node = node || this.node;
    const isExpanded = node && this._treeState.treeControl.isExpanded(node);
    if (this.isExpanded === isExpanded) {
      return;
    }
    this.isExpanded = isExpanded;
    this.toggleStateIcon = isExpanded ? ICON_EXPANDED : ICON_COLLAPSED;
  }
}
