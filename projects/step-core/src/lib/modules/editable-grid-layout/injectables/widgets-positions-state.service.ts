import { computed, inject, Injectable, signal, untracked } from '@angular/core';
import { WidgetPosition } from '../types/widget-position';
import { GRID_COLUMN_COUNT } from './grid-column-count.token';

@Injectable()
export class WidgetsPositionsStateService {
  private _colCount = inject(GRID_COLUMN_COUNT);

  private readonly positionsStateInternal = signal<Record<string, WidgetPosition>>({});

  readonly positions = this.positionsStateInternal.asReadonly();

  private readonly filedState = computed(() => {
    const positions = Object.values(this.positions());
    const fieldBottom = Math.max(...positions.map((item) => item.bottomEdge));
    const size = this._colCount * fieldBottom;

    const field = new Uint8Array(size);
    positions.forEach((item) => this.fillPosition(field, item, 1));
    return field;
  });

  getPosition(elementId: string): WidgetPosition | undefined {
    return untracked(() => this.positions())[elementId];
  }

  updatePosition(position: WidgetPosition): void {
    this.positionsStateInternal.update((value) => ({
      ...value,
      [position.id]: position,
    }));
  }

  swapPositions(aElementId: string, bElementId: string): void {
    const positions = untracked(() => this.positions());
    const positionA = positions[aElementId];
    const positionB = positions[bElementId];
    if (!positionA || !positionB) {
      return;
    }
    const newPositionA = new WidgetPosition(aElementId, positionB);
    const newPositionB = new WidgetPosition(bElementId, positionA);
    this.positionsStateInternal.update((value) => ({
      ...value,
      [newPositionA.id]: newPositionA,
      [newPositionB.id]: newPositionB,
    }));
  }

  correctPositionForDrag(elementId: string, position: WidgetPosition): WidgetPosition | undefined {
    // Erase information about original position to avoid conflicts for current element
    if (!this.clearElementPosition(elementId)) {
      return undefined;
    }

    //If position is taken by other widget, return other's widgets original position
    if (this.isCellTaken(position.row, position.column)) {
      const otherWidgetPosition = Object.values(untracked(() => this.positions())).find(
        (pos) => pos.id !== elementId && pos.includesPoint(position.row, position.column),
      );

      return otherWidgetPosition;
    }

    const result = position.clone();
    result.applyLimits(this._colCount);

    // Determine width / height
    let row = 0;
    let column = 0;
    let heightInCells = 0;
    let widthInCells = 0;
    for (let r = result.topEdge; r <= result.bottomEdge; r++) {
      row = r;
      let widthInCellPerRow = 0;
      for (let c = result.leftEdge; c <= result.rightEdge; c++) {
        column = c;
        if (this.isCellTaken(row, column)) {
          break;
        }
        widthInCellPerRow++;
      }
      widthInCells = Math.max(widthInCells, widthInCellPerRow);
      if (this.isCellTaken(row, column)) {
        if (heightInCells === 0) {
          heightInCells = result.heightInCells;
        }
        if (widthInCells === 0) {
          widthInCells = result.widthInCells;
        }
        break;
      }
      heightInCells++;
    }

    if (heightInCells <= 0 || widthInCells <= 0) {
      return undefined;
    }
    result.widthInCells = widthInCells;
    result.heightInCells = heightInCells;

    return result;
  }

  correctPositionForResize(elementId: string, position: WidgetPosition): WidgetPosition | undefined {
    // Erase information about original position to avoid conflicts for current element
    if (!this.clearElementPosition(elementId)) {
      return undefined;
    }

    const result = position.clone();
    result.applyLimits(this._colCount);

    let r: number;
    let c: number;

    // Check top edge
    r = result.row;
    for (c = result.leftEdge; c <= result.rightEdge; c++) {
      while (this.isCellTaken(r, c) && r <= result.bottomEdge + 1) {
        r++;
      }
    }
    if (r > result.bottomEdge) {
      return undefined;
    }
    result.row = r;

    // Check right edge
    c = result.rightEdge;
    for (r = result.topEdge; r <= result.bottomEdge; r++) {
      while (this.isCellTaken(r, c) && c >= result.leftEdge - 1) {
        c--;
      }
    }
    if (c < result.leftEdge) {
      return undefined;
    }
    result.widthInCells -= result.rightEdge - c;

    // Check bottom edge
    r = result.bottomEdge;
    for (c = result.leftEdge; c <= result.rightEdge; c++) {
      while (this.isCellTaken(r, c) && r >= result.topEdge - 1) {
        r--;
      }
    }
    if (r < result.topEdge) {
      return undefined;
    }
    result.heightInCells -= result.bottomEdge - r;

    // Check left edge
    c = result.column;
    for (r = result.topEdge; r <= result.bottomEdge; r++) {
      while (this.isCellTaken(r, c) && c <= result.rightEdge + 1) {
        c++;
      }
    }
    if (c > result.rightEdge) {
      return undefined;
    }
    result.column = c;
    return result;
  }

  private isCellTaken(row: number, column: number): boolean {
    const field = untracked(() => this.filedState());
    const index = this.getFieldIndex(row, column);
    if (index >= field.length) {
      return false;
    }
    return !!field[index];
  }

  private fillPosition(field: Uint8Array, position: WidgetPosition, fillValue: number): void {
    for (let r = position.topEdge; r <= position.bottomEdge; r++) {
      for (let c = position.leftEdge; c <= position.rightEdge; c++) {
        const index = this.getFieldIndex(r, c);
        field[index] = fillValue;
      }
    }
  }

  private clearElementPosition(elementId: string): boolean {
    const originalPosition = untracked(() => this.positions())[elementId];
    if (!originalPosition) {
      return false;
    }
    const filed = untracked(() => this.filedState());
    this.fillPosition(filed, originalPosition, 0);
    return true;
  }

  private getFieldIndex(row: number, column: number): number {
    return (row - 1) * this._colCount + (column - 1);
  }
}
