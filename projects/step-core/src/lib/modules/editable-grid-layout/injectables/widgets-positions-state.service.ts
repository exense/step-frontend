import { computed, DestroyRef, inject, Injectable, OnDestroy, signal, untracked } from '@angular/core';
import { WidgetPosition, WidgetPositionParams } from '../types/widget-position';
import { GRID_COLUMN_COUNT } from './grid-column-count.token';
import { GridEditableService } from './grid-editable.service';
import { WidgetIDs } from '../types/widget-ids';
import { GRID_LAYOUT_CONFIG } from './grid-layout-config.token';
import { GridPersistencePositionsService } from './grid-persistence-positions.service';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, switchMap } from 'rxjs';
import { GridElementInfo } from '../../custom-registeries/custom-registries.module';
import { PositionToApply } from '../types/position-to-apply';

const EMPTY = 0;

@Injectable()
export class WidgetsPositionsStateService implements OnDestroy {
  private _gridConfig = inject(GRID_LAYOUT_CONFIG);
  private _colCount = inject(GRID_COLUMN_COUNT);
  private _gridEditable = inject(GridEditableService);
  private _gridPersistencePositions = inject(GridPersistencePositionsService);
  private _destroyRef = inject(DestroyRef);

  private widgetIDs = new WidgetIDs(this._gridConfig.defaultElementParams.map((item) => item.id));

  private readonly isInitializedInternal = signal(false);
  readonly isInitialized = this.isInitializedInternal.asReadonly();

  private readonly hiddenWidgets = signal<string[]>([]);
  private readonly positionsStateInternal = signal<Record<string, WidgetPosition>>({});

  private readonly positionsState$ = toObservable(this.positionsStateInternal);

  readonly positions = computed(() => {
    const positions = this.positionsStateInternal();
    const hiddenWidgets = this.hiddenWidgets();
    const isEditMode = this._gridEditable.editMode();
    if (isEditMode) {
      return positions;
    }
    return this.realignPositionsWithHiddenWidgets(positions, hiddenWidgets);
  });

  private readonly fieldBottom = computed(() => {
    const positions = Object.values(this.positionsStateInternal());
    if (!positions.length) {
      return 0;
    }
    return Math.max(...positions.map((item) => item.bottomEdge));
  });

  private readonly fieldState = computed(() => {
    const positions = Object.values(this.positionsStateInternal());
    const fieldBottom = this.fieldBottom();
    if (!positions.length || !fieldBottom) {
      return new Uint8Array(0);
    }
    const size = this._colCount * fieldBottom;

    const field = new Uint8Array(size);
    positions.forEach((item) => this.fillPosition(field, item));
    return field;
  });

  constructor() {
    this.initialize();
  }

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

  correctPositionForDrag(elementId: string, position: WidgetPosition): PositionToApply | undefined {
    // Erase information about original position to avoid conflicts for current element
    if (!this.clearElementPosition(elementId)) {
      return undefined;
    }

    //If position is taken by other widget, return other's widgets original position
    if (this.isCellTaken(position.row, position.column)) {
      const otherWidgetPosition = Object.values(untracked(() => this.positionsStateInternal())).find(
        (pos) => pos.id !== elementId && pos.includesPoint(position.row, position.column),
      );

      if (!otherWidgetPosition) {
        return undefined;
      }

      const positionLimits = this.getElementLimits(elementId);
      const otherPositionLimits = this.getElementLimits(otherWidgetPosition.id);

      // check the possibility to swap
      // to do it both widgets should fit to the limits of each other
      const canBeApplied =
        this.isFit({
          width: positionLimits.minWidthInCells,
          height: positionLimits.minHeightInCells,
          availableWidth: otherWidgetPosition.widthInCells,
          availableHeight: otherWidgetPosition.heightInCells,
        }) &&
        this.isFit({
          width: otherPositionLimits.minWidthInCells,
          height: otherPositionLimits.minHeightInCells,
          availableWidth: position.widthInCells,
          availableHeight: position.heightInCells,
        });

      return { canBeApplied, position: otherWidgetPosition };
    }

    const result = position.clone();
    this.applyEdgeLimits(result, this._colCount);

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

    const limits = this.getElementLimits(elementId);
    const canBeApplied = this.isFit({
      width: limits.minWidthInCells,
      height: limits.minHeightInCells,
      availableWidth: result.widthInCells,
      availableHeight: result.heightInCells,
    });

    return { canBeApplied, position: result };
  }

  correctPositionForResize(elementId: string, position: WidgetPosition): WidgetPosition | undefined {
    // Erase information about original position to avoid conflicts for current element
    if (!this.clearElementPosition(elementId)) {
      return undefined;
    }

    const result = position.clone();
    this.applyEdgeLimits(result, this._colCount);

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

    //apply min limits
    const { minWidthInCells, minHeightInCells } = this.getElementLimits(elementId);
    this.applyMinLimits(result, minWidthInCells, minHeightInCells);

    return result;
  }

  findProperPosition(widthInCells: number, heightInCells: number): WidgetPositionParams {
    // First search for last widget
    const field = untracked(() => this.fieldState());
    const widgetPositions = untracked(() => this.positionsStateInternal());

    let widgetId: string | undefined = undefined;

    for (let index = field.length - 1; index >= 0; index--) {
      if (field[index] !== EMPTY) {
        widgetId = this.widgetIDs.getStringIdByNumber(field[index]);
        break;
      }
    }

    // If there is no widgets, define new one at first position
    if (widgetId === undefined) {
      return { row: 1, column: 1, widthInCells, heightInCells };
    }

    const lastWidgetPosition = widgetPositions[widgetId];

    // If last widget heights smaller the new widget's height - allocate new widget on the new row
    const nextRow = lastWidgetPosition.bottomEdge + 1;
    if (lastWidgetPosition.heightInCells < heightInCells) {
      return { row: nextRow, column: 1, widthInCells, heightInCells };
    }

    // Check if there is enough available cells in width after last widget
    const column = lastWidgetPosition.rightEdge + 1;
    const rightEdge = column + widthInCells - 1;
    if (rightEdge > this._colCount) {
      //If not allocate new widget on the new row
      return { row: nextRow, column: 1, widthInCells, heightInCells };
    }

    // In case of available space, allocate new widget just after the last one
    return { row: lastWidgetPosition.row, column, widthInCells, heightInCells };
  }

  setHiddenWidgets(widgetsIds: string[]): void {
    this.hiddenWidgets.set(widgetsIds);
  }

  private initialize(): void {
    const isInitialized = untracked(() => this.isInitialized());
    if (isInitialized) {
      return;
    }
    this._gridPersistencePositions.loadPositions(this._gridConfig.gridId).subscribe((positions) => {
      this.positionsStateInternal.set(positions);
      this.determineInitialPositions();
      this.isInitializedInternal.set(true);
      this.setupPositionsSync();
    });
  }

  private isCellTaken(row: number, column: number): boolean {
    const field = untracked(() => this.fieldState());
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
    const field = untracked(() => this.fieldState());
    this.fillPosition(field, originalPosition, true);
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
    const field = untracked(() => this.fieldState());
    const fieldBottom = untracked(() => this.fieldBottom());
    const hiddenWidgetsNumIds = new Set(hiddenWidgets.map((idStr) => this.widgetIDs.getNumericIdByString(idStr)));

    // This arrays show, how many rows are skipped above each row
    const hiddenRowsState: number[] = new Array(fieldBottom);

    for (let row = 1; row <= fieldBottom; row++) {
      let hiddenColCount = 0;
      for (let col = 1; col <= this._colCount; col++) {
        const index = this.getFieldIndex(row, col);
        const widgetId = field[index];
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

  private determineInitialPositions(): void {
    for (const info of this._gridConfig.defaultElementParams) {
      if (!!this.getPosition(info.id)) {
        continue;
      }
      const positionParams = this.findProperPosition(info.widthInCells, info.heightInCells);
      const position = new WidgetPosition(info.id, positionParams);
      this.updatePosition(position);
    }
  }

  private setupPositionsSync(): void {
    this.positionsState$
      .pipe(
        debounceTime(300),
        switchMap((positions) => this._gridPersistencePositions.savePositions(this._gridConfig.gridId, positions)),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe();
  }

  private getElementLimits(elementId: string): Pick<GridElementInfo, 'minWidthInCells' | 'minHeightInCells'> {
    return this._gridConfig.defaultElementParamsMap?.[elementId] ?? {};
  }

  private applyEdgeLimits(pos: WidgetPosition, maxRightEdgeInCells?: number, maxBottomEdgeInCells?: number): void {
    if (pos.row <= 0) {
      pos.row = 1;
    }

    if (pos.column <= 0) {
      pos.column = 1;
    }

    if (maxRightEdgeInCells !== undefined) {
      if (pos.rightEdge > maxRightEdgeInCells) {
        const diff = Math.abs(maxRightEdgeInCells - pos.rightEdge);
        pos.widthInCells -= diff;
      }
    }

    if (maxBottomEdgeInCells !== undefined) {
      if (pos.bottomEdge > maxBottomEdgeInCells) {
        const diff = Math.abs(maxBottomEdgeInCells - pos.bottomEdge);
        pos.heightInCells -= diff;
      }
    }
  }

  private applyMinLimits(pos: WidgetPosition, minWidthInCells: number = 1, minHeightInCells: number = 1): void {
    if (pos.row <= 0) {
      pos.row = 1;
    }

    if (pos.column <= 0) {
      pos.column = 1;
    }

    pos.widthInCells = Math.max(pos.widthInCells, minWidthInCells);
    pos.heightInCells = Math.max(pos.heightInCells, minHeightInCells);
  }

  private isFit({
    width,
    height,
    availableWidth,
    availableHeight,
  }: {
    width?: number;
    height?: number;
    availableWidth?: number;
    availableHeight?: number;
  }): boolean {
    let isWidthFit = true;
    if (width !== undefined && availableWidth !== undefined) {
      isWidthFit = width <= availableWidth;
    }
    let isHeightFit = true;
    if (height !== undefined && availableHeight !== undefined) {
      isHeightFit = height <= availableHeight;
    }
    return isWidthFit && isHeightFit;
  }
}
