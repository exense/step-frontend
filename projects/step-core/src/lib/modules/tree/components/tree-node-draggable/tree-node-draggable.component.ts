import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  Renderer2,
  ViewEncapsulation,
  viewChild,
} from '@angular/core';
import { TreeNodeDirective } from '../../directives/tree-node.directive';
import { TreeNodeTemplateContainerService } from '../../services/tree-node-template-container.service';
import { DRAG_DROP_EXPORTS, DragDataService, DropInfo } from '../../../drag-drop';
import { toSignal } from '@angular/core/rxjs-interop';
import { StepIconsModule } from '../../../step-icons/step-icons.module';
import { StepMaterialModule } from '../../../step-material/step-material.module';
import { TreeNodeNameComponent } from '../tree-node-name/tree-node-name.component';
import { NgTemplateOutlet } from '@angular/common';
import { TreeStateService } from '../../services/tree-state.service';
import { TreeNode } from '../../types/tree-node';
import { tap } from 'rxjs';
import { StepBasicsModule } from '../../../basics/step-basics.module';
import { PopoverComponent, PopoverMode } from '../../../basics/components/popover/popover.component';
import { TreeNodeDropHintDirective } from '../../directives/tree-node-drop-hint.directive';

@Component({
  selector: 'step-tree-node-draggable',
  templateUrl: './tree-node-draggable.component.html',
  styleUrls: ['../tree-node/tree-node.component.scss', './tree-node-draggable.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DRAG_DROP_EXPORTS,
    StepIconsModule,
    StepMaterialModule,
    TreeNodeNameComponent,
    NgTemplateOutlet,
    StepBasicsModule,
  ],
  hostDirectives: [
    {
      directive: TreeNodeDirective,
      inputs: ['node'],
      outputs: ['contextMenu'],
    },
  ],
  host: {
    '[class.is-drag-in-progress]': 'isDragInProgress()',
    '[class.is-drag-active]': 'isDragActive()',
    '[class.drop-disabled]': '!isDragInProgress() && isDropTargetDisabled()',
  },
})
export class TreeNodeDraggableComponent implements AfterViewInit {
  private readonly row = viewChild<ElementRef<HTMLElement>>('row');
  private readonly _renderer = inject(Renderer2);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly dropPopover = viewChild(PopoverComponent);
  private readonly dropHint = contentChild(TreeNodeDropHintDirective);
  private isDropHintOpen = false;
  protected readonly PopoverMode = PopoverMode;
  private _dragDataService = inject(DragDataService);
  private _treeState = inject<TreeStateService<unknown, TreeNode>>(TreeStateService);

  protected readonly _treeNode = inject(TreeNodeDirective, { self: true });
  protected readonly _treeNodeTemplateContainer = inject(TreeNodeTemplateContainerService);

  /** @Input() **/
  readonly dragDisabled = input(false);

  /** @Input() **/
  readonly dropDisabled = input(false);

  /** @Output() **/
  readonly dragOver = output<DropInfo>();

  /** @Output() **/
  readonly dropNode = output<DropInfo>();

  private readonly dragData = toSignal(
    this._dragDataService.dragData$.pipe(
      tap(() => {
        this.closeDropHint();
        const row = this.row()?.nativeElement;
        if (row) {
          this._renderer.removeClass(row, 'is-drop-row-hovered');
        }
      }),
    ),
  );

  protected readonly isDragActive = computed(() => !!this.dragData());

  protected readonly isDropTargetDisabled = computed(() => {
    const draggedElement = this.dragData();
    const node = this._treeNode.node();
    return !!draggedElement && this._treeState.canDropTo?.({ draggedElement, droppedArea: node.id }) === false;
  });

  protected readonly siblingDropTargets = computed(() => {
    const node = this._treeNode.node();
    const draggedElement = this.dragData();
    const dropDisabled = this.dropDisabled();
    const nextNode = this._treeState.getNextVisibleNode(node.id, { skipDescendants: draggedElement === node.id });
    if (dropDisabled) {
      return [];
    }
    return node.parentPath
      .map((parentId, level) => ({ parentId, level, siblingId: node.parentPath[level + 1] || node.id }))
      .filter(({ parentId, siblingId }) => {
        if (nextNode?.parentPath.includes(siblingId)) {
          return false;
        }
        return (
          this._treeState.canDropTo?.({ draggedElement, droppedArea: parentId, additionalInfo: siblingId }) !== false
        );
      });
  });

  protected readonly canDropFirstChild = computed(() => {
    const node = this._treeNode.node();
    const draggedElement = this.dragData();
    const dropDisabled = this.dropDisabled();
    return (
      !dropDisabled &&
      node.hasChild &&
      this._treeState.canDropTo?.({ draggedElement, droppedArea: node.id, additionalInfo: 'first' }) !== false
    );
  });

  ngAfterViewInit(): void {
    const row = this.row()!.nativeElement;
    const stopDragEnter = this._renderer.listen(
      row,
      'dragenter',
      () => {
        if (this._dragDataService.isDragStarted) {
          this._renderer.addClass(row, 'is-drop-row-hovered');
        }
      },
      { capture: true },
    );
    const stopDragLeave = this._renderer.listen(
      row,
      'dragleave',
      (event: DragEvent) => {
        const nextTarget = event.relatedTarget ?? row.ownerDocument.elementFromPoint?.(event.clientX, event.clientY);
        if (!(nextTarget instanceof Node) || !row.contains(nextTarget)) {
          this._renderer.removeClass(row, 'is-drop-row-hovered');
        }
      },
      { capture: true },
    );
    this._destroyRef.onDestroy(() => {
      stopDragEnter();
      stopDragLeave();
    });
  }

  protected handleDragOver(): void {
    if (this.dropDisabled() || !this._dragDataService.isDragStarted) {
      return;
    }
    this.dragOver.emit({ draggedElement: this.dragData(), droppedArea: this._treeNode.node().id });
  }

  protected handleNodeDragEnter(): void {
    if (
      !this._dragDataService.isDragStarted ||
      this.dropDisabled() ||
      this.isDragInProgress() ||
      !this.dropHint() ||
      this.isDropHintOpen
    ) {
      return;
    }
    this.isDropHintOpen = true;
    this.dropPopover()?.openPopover();
  }

  protected handleNodeDrop(event: DropInfo): void {
    this.closeDropHint();
    this.dropNode.emit(event);
  }

  protected closeDropHint(): void {
    if (!this.isDropHintOpen) {
      return;
    }
    this.isDropHintOpen = false;
    this.dropPopover()?.closePopover();
  }

  protected readonly isDragInProgress = computed(() => {
    const dragData = this.dragData();
    const nodeId = this._treeNode.node()?.id;
    return dragData === nodeId;
  });
}
