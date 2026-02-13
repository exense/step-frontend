import { computed, ElementRef, inject, Injectable, OnDestroy, Renderer2, signal, untracked } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { WidgetsPositionsStateService } from './widgets-positions-state.service';
import { GridDimensionsService } from './grid-dimensions.service';
import { gridElementId } from '../types/grid-element-id';
import { PositionToApply } from '../types/position-to-apply';
import {GridPoint} from '../types/widget-position';

@Injectable()
export class GridElementDragService implements OnDestroy {
  private _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private _renderer = inject(Renderer2);
  private _doc = inject(DOCUMENT);
  private _widgetsPositions = inject(WidgetsPositionsStateService);
  private _gridDimensions = inject(GridDimensionsService);

  private previewElement?: HTMLElement;
  private stopDragMove?: () => void;
  private stopDragEnd?: () => void;

  private readonly draggedElement = signal<HTMLElement | undefined>(undefined);

  readonly dragInProgress = computed(() => {
    const draggedElement = this.draggedElement();
    return !!draggedElement;
  });

  private readonly dragNotAppliedInternal = signal(false);
  readonly dragNotApplied = this.dragNotAppliedInternal.asReadonly();

  private xDragOffset = 0;

  ngOnDestroy(): void {
    this.stopDragMove?.();
    this.stopDragEnd?.();
  }

  setupPreviewElement(previewElement: HTMLElement): void {
    this.previewElement = previewElement;
  }

  dragStart(element: HTMLElement, event: MouseEvent): void {
    if (!!untracked(() => this.draggedElement())) {
      return;
    }
    this.xDragOffset = event.clientX - element.getBoundingClientRect().x;
    this.dragNotAppliedInternal.set(false);
    this.draggedElement.set(element);

    const preview = this.previewElement;
    if (preview) {
      preview.style.top = `${element.offsetTop}px`;
      preview.style.left = `${element.offsetLeft}px`;
      preview.style.width = `${element.clientWidth}px`;
      preview.style.height = `${element.clientHeight}px`;
    }

    this.stopDragMove = this._renderer.listen(this._doc.body, 'mousemove', (event: MouseEvent) => this.dragMove(event));
    this.stopDragEnd = this._renderer.listen(this._doc.body, 'mouseup', (event: MouseEvent) => this.dragEnd(event));
  }

  private dragMove(event: MouseEvent): void {
    const element = untracked(() => this.draggedElement());
    const preview = this.previewElement;
    if (!element || !preview) {
      return;
    }

    let left = `${element.offsetLeft}px`;
    let top = `${element.offsetTop}px`;
    let width = `${element.clientWidth}px`;
    let height = `${element.clientHeight}px`;

    const result = this.determineDragPosition(element, event.clientX, event.clientY);
    if (result) {
      const position = result.position;
      const newLeft = this._gridDimensions.determineCellsWidth(position.column - 1);
      const newTop = this._gridDimensions.determineCellsHeight(position.row - 1);
      const newWidth = this._gridDimensions.determineCellsWidth(position.widthInCells) - this._gridDimensions.columnGap;
      const newHeight = this._gridDimensions.determineCellsHeight(position.heightInCells) - this._gridDimensions.rowGap;
      left = `${newLeft}px`;
      top = `${newTop}px`;
      width = `${newWidth}px`;
      height = `${newHeight}px`;
    }

    this.dragNotAppliedInternal.set(!result?.canBeApplied);

    preview.style.left = left;
    preview.style.top = top;
    preview.style.width = width;
    preview.style.height = height;
  }

  private dragEnd(event: MouseEvent): void {
    const element = untracked(() => this.draggedElement());
    if (!element) {
      return;
    }
    const id = gridElementId(element);
    if (!id) {
      return;
    }

    const result = this.determineDragPosition(element, event.clientX, event.clientY);
    if (result?.canBeApplied) {
      const position = result.position;
      if (position.id !== id) {
        this._widgetsPositions.swapPositions(id, position.id);
      } else {
        this._widgetsPositions.updatePosition(position);
      }
    }

    this.xDragOffset = 0;
    this.stopDragMove?.();
    this.stopDragMove = undefined;
    this.stopDragEnd?.();
    this.stopDragEnd = undefined;
    this.draggedElement.set(undefined);
    this.dragNotAppliedInternal.set(false);
  }

  private determineDragPosition(element: HTMLElement, mouseX: number, mouseY: number): PositionToApply | undefined {
    const id = gridElementId(element);
    if (!id) {
      return undefined;
    }

    const originalPosition = this._widgetsPositions.getPosition(id);
    if (!originalPosition) {
      return undefined;
    }

    const gridRect = this._elementRef.nativeElement.getBoundingClientRect();
    const column = Math.max(this._gridDimensions.determineCellColumn(mouseX - gridRect.x - this.xDragOffset), 1);
    const row = this._gridDimensions.determineCellRow(mouseY - gridRect.y);

    const dragPoint: GridPoint = {
      column: this._gridDimensions.determineCellColumn(mouseX - gridRect.x),
      row
    };

    const position = originalPosition.clone();
    position.column = column;
    position.row = row;


    console.log('DRAG MOVE', id, JSON.stringify(position), JSON.stringify(dragPoint));

    const result = this._widgetsPositions.correctPositionForDrag(id, position, dragPoint);
    if (result) {
      console.log('DRAG MOVE RESULT', result.canBeApplied, JSON.stringify(result.position));
    } else {
      console.log('DRAG MOVE RESULT', 'NONE');
    }
    return result;
  }
}
