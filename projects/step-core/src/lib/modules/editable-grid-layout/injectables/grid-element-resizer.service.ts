import { computed, inject, Injectable, OnDestroy, Renderer2, signal, untracked } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { WidgetsPositionsStateService } from './widgets-positions-state.service';
import { GridDimensionsService } from './grid-dimensions.service';
import { WidgetPosition } from '../types/widget-position';
import { gridElementId } from '../types/grid-element-id';

@Injectable()
export class GridElementResizerService implements OnDestroy {
  private _renderer = inject(Renderer2);
  private _doc = inject(DOCUMENT);
  private _widgetsPositions = inject(WidgetsPositionsStateService);
  private _gridDimensions = inject(GridDimensionsService);

  private previewElement?: HTMLElement;
  private stopResizeMove?: () => void;
  private stopResizeEnd?: () => void;

  private readonly resizedElement = signal<HTMLElement | undefined>(undefined);

  readonly resizeInProgress = computed(() => {
    const resizedElement = this.resizedElement();
    return !!resizedElement;
  });

  ngOnDestroy(): void {
    this.stopResizeMove?.();
    this.stopResizeEnd?.();
  }

  setupPreviewElement(previewElement: HTMLElement): void {
    this.previewElement = previewElement;
  }

  resizeStart(element: HTMLElement): void {
    if (!!untracked(() => this.resizedElement())) {
      return;
    }
    this.resizedElement.set(element);

    const preview = this.previewElement;
    if (preview) {
      preview.style.top = `${element.offsetTop}px`;
      preview.style.left = `${element.offsetLeft}px`;
      preview.style.width = `${element.clientWidth}px`;
      preview.style.height = `${element.clientHeight}px`;
    }

    this.stopResizeMove = this._renderer.listen(this._doc.body, 'mousemove', (event: MouseEvent) =>
      this.resizeMove(event),
    );
    this.stopResizeEnd = this._renderer.listen(this._doc.body, 'mouseup', (event: MouseEvent) => this.resizeEnd(event));
  }

  private resizeMove(event: MouseEvent): void {
    const element = untracked(() => this.resizedElement());
    const preview = this.previewElement;
    if (!element || !preview) {
      return;
    }

    let left = `${element.offsetLeft}px`;
    let top = `${element.offsetTop}px`;
    let width = `${element.clientWidth}px`;
    let height = `${element.clientHeight}px`;

    const position = this.determineResizedPosition(element, event.clientX, event.clientY);
    if (position) {
      const newWidth = this._gridDimensions.determineCellsWidth(position.widthInCells);
      const newHeight = this._gridDimensions.determineCellsHeight(position.heightInCells);
      width = `${newWidth}px`;
      height = `${newHeight}px`;
    }

    preview.style.left = left;
    preview.style.top = top;
    preview.style.width = width;
    preview.style.height = height;
  }

  private resizeEnd(event: MouseEvent): void {
    const element = untracked(() => this.resizedElement());
    if (!element) {
      return;
    }

    const position = this.determineResizedPosition(element, event.clientX, event.clientY);
    if (position) {
      this._widgetsPositions.updatePosition(position);
    }

    this.stopResizeMove?.();
    this.stopResizeMove = undefined;
    this.stopResizeEnd?.();
    this.stopResizeEnd = undefined;
    this.resizedElement.set(undefined);
  }

  private determineResizedPosition(element: HTMLElement, mouseX: number, mouseY: number): WidgetPosition | undefined {
    const id = gridElementId(element);
    if (!id) {
      return undefined;
    }
    const rect = element.getBoundingClientRect();
    const distanceX = mouseX - rect.x;
    const distanceY = mouseY - rect.y;

    if (distanceX <= 0 || distanceY <= 0) {
      return undefined;
    }

    const column = this._gridDimensions.determineCellColumn(element.offsetLeft + this._gridDimensions.columnGap);
    const row = this._gridDimensions.determineCellRow(element.offsetTop + this._gridDimensions.rowGap);
    const widthInCells = this._gridDimensions.determineCellColumn(distanceX);
    const heightInCells = this._gridDimensions.determineCellRow(distanceY);

    const widgetPosition = new WidgetPosition(id, { column, row, widthInCells, heightInCells });
    return this._widgetsPositions.correctPositionForResize(id, widgetPosition);
  }
}
