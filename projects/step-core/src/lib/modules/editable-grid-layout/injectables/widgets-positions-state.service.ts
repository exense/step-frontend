import { computed, inject, Injectable, OnDestroy, signal, untracked } from '@angular/core';
import { WidgetPosition } from '../types/widget-position';
import { GRID_COLUMN_COUNT } from './grid-column-count.token';
import { GridEditableService } from './grid-editable.service';
import { WidgetIDs } from '../types/widget-ids';
import { GRID_LAYOUT_CONFIG } from './grid-layout-config.token';

const EMPTY = 0;

@Injectable()
export class WidgetsPositionsStateService implements OnDestroy {
  private _gridConfig = inject(GRID_LAYOUT_CONFIG);
  private _colCount = inject(GRID_COLUMN_COUNT);
  private _gridEditable = inject(GridEditableService);

  private widgetIDs = new WidgetIDs(Object.keys(this._gridConfig.defaultElementParams));

  protected readonly hiddenWidgets = signal<string[]>([]);
  private readonly positionsStateInternal = signal<Record<string, WidgetPosition>>(this.determineInitialPositions());

  readonly positions = computed(() => {
    const positions = this.positionsStateInternal();
    const hiddenWidgets = this.hiddenWidgets();
    const isEditMode = this._gridEditable.editMode();
    if (isEditMode) {
      return positions;
    }
    return this.realignPositionsWithHiddenWidgets(positions, hiddenWidgets);
  });

  private readonly filedState = computed(() => {
    const positions = Object.values(this.positionsStateInternal());
    if (!positions.length) {
      return new Uint8Array(0);
    }
    const fieldBottom = Math.max(...positions.map((item) => item.bottomEdge));
    const size = this._colCount * fieldBottom;

    const field = new Uint8Array(size);
    positions.forEach((item) => this.fillPosition(field, item));
    return field;
  });

  ngOnDestroy(): void {
    this.widgetIDs.destroy();
  }

  getPosition(elementId: string): WidgetPosition | undefined {
    return untracked(() => this.positionsStateInternal())[elementId];
  }

  updatePosition(position: WidgetPosition): void {
    this.positionsStateInternal.update((value) => ({
      ...value,
      [position.id]: position,
    }));
  }

  swapPositions(aElementId: string, bElementId: string): void {
    const positions = untracked(() => this.positionsStateInternal());
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
      const otherWidgetPosition = Object.values(untracked(() => this.positionsStateInternal())).find(
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

    // Check inside cells
    let row = 0;
    let column = 0;
    let newHeight = 0;
    let newWidth = -1;
    for (r = result.topEdge; r <= result.bottomEdge; r++) {
      row = r;
      let localNewWidth = 0;
      for (c = result.leftEdge; c <= result.rightEdge; c++) {
        column = c;
        if (this.isCellTaken(row, column)) {
          break;
        }
        localNewWidth++;
      }
      newWidth = newWidth < 0 ? localNewWidth : Math.min(newWidth, localNewWidth);
      if (this.isCellTaken(row, column)) {
        break;
      }
      newHeight++;
    }

    result.widthInCells = newWidth;
    result.heightInCells = newHeight;

    return result;
  }

  setHiddenWidgets(widgetsIds: string[]): void {
    this.hiddenWidgets.set(widgetsIds);
  }

  private isCellTaken(row: number, column: number): boolean {
    const field = untracked(() => this.filedState());
    const index = this.getFieldIndex(row, column);
    if (index >= field.length) {
      return false;
    }
    return !!field[index];
  }

  private fillPosition(field: Uint8Array, position: WidgetPosition, isClear?: boolean): void {
    const fillValue = isClear ? EMPTY : this.widgetIDs.getNumericIdByString(position.id);

    for (let r = position.topEdge; r <= position.bottomEdge; r++) {
      for (let c = position.leftEdge; c <= position.rightEdge; c++) {
        const index = this.getFieldIndex(r, c);
        field[index] = fillValue;
      }
    }
  }

  private clearElementPosition(elementId: string): boolean {
    const originalPosition = untracked(() => this.positionsStateInternal())[elementId];
    if (!originalPosition) {
      return false;
    }
    const filed = untracked(() => this.filedState());
    this.fillPosition(filed, originalPosition, true);
    return true;
  }

  private getFieldIndex(row: number, column: number): number {
    return (row - 1) * this._colCount + (column - 1);
  }

  private realignPositionsWithHiddenWidgets(
    originalPositions: Record<string, WidgetPosition>,
    hiddenWidgets: string[],
  ): Record<string, WidgetPosition> {
    const positions = Object.values(originalPositions);
    if (!positions.length || !hiddenWidgets?.length) {
      return originalPositions;
    }
    const filed = untracked(() => this.filedState());
    const hiddenWidgetsNumIds = new Set(hiddenWidgets.map((idStr) => this.widgetIDs.getNumericIdByString(idStr)));
    const fieldBottom = Math.max(...positions.map((item) => item.bottomEdge));

    // This arrays show, how many rows are skipped above each row
    const hiddenRowsState: number[] = new Array(fieldBottom);

    for (let row = 1; row <= fieldBottom; row++) {
      let hiddenColCount = 0;
      for (let col = 1; col <= this._colCount; col++) {
        const index = this.getFieldIndex(row, col);
        const widgetId = filed[index];
        if (hiddenWidgetsNumIds.has(widgetId) || widgetId === EMPTY) {
          hiddenColCount++;
        }
      }
      const rowIndex = row - 1;
      hiddenRowsState[rowIndex] = rowIndex === 0 ? 0 : hiddenRowsState[rowIndex - 1];
      if (hiddenColCount === this._colCount) {
        hiddenRowsState[rowIndex]++;
      }
    }

    const result = positions.reduce(
      (res, position) => {
        const idNum = this.widgetIDs.getNumericIdByString(position.id);
        if (hiddenWidgetsNumIds.has(idNum)) {
          return res;
        }

        const updatesPos = position.clone();
        const hiddenRows = hiddenRowsState[updatesPos.row - 1];
        updatesPos.row -= hiddenRows;
        res[position.id] = updatesPos;

        return res;
      },
      {} as Record<string, WidgetPosition>,
    );

    return result;
  }

  private determineInitialPositions(): Record<string, WidgetPosition> {
    return Object.entries(this._gridConfig.defaultElementParams).reduce(
      (res, [key, info]) => {
        res[key] = new WidgetPosition(key, info.position);
        return res;
      },
      {} as Record<string, WidgetPosition>,
    );
  }
}
