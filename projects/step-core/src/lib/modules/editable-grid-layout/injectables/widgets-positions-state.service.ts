import { computed, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { GridPoint, WidgetPosition } from '../types/widget-position';
import { GRID_COLUMN_COUNT } from './grid-column-count.token';
import { GridEditableService } from './grid-editable.service';
import { GRID_LAYOUT_CONFIG } from './grid-layout-config.token';
import { PositionToApply } from '../types/position-to-apply';
import { WidgetsPositionsUtilsService } from './widgets-positions-utils.service';
import { WidgetPositionsUtilsContext } from '../types/widget-positions-utils-context';
import { v4 } from 'uuid';

@Injectable()
export class WidgetsPositionsStateService implements WidgetPositionsUtilsContext, GridEditableService {
  private _gridConfig = inject(GRID_LAYOUT_CONFIG);
  private _colCount = inject(GRID_COLUMN_COUNT);
  private _utils = inject(WidgetsPositionsUtilsService).withContext(this);

  private readonly editModeInternal = signal(false);
  readonly editMode = this.editModeInternal.asReadonly();

  setEditMode(value: boolean): void {
    this.editModeInternal.set(value);
  }

  private readonly notRenderedWidgetTypes = signal<string[]>([]);
  private readonly positionsStateInternal = signal<Record<string, WidgetPosition>>({});
  readonly positionsState = this.positionsStateInternal.asReadonly();

  private readonly extraRows = signal(0);

  private effectResetExtraRows = effect(() => {
    const isEditMode = this.editMode();
    if (!isEditMode) {
      this.extraRows.set(0);
    }
  });

  readonly widgetsBottom = computed(() => {
    const positions = Object.values(this.positionsStateInternal());
    if (!positions.length) {
      return 0;
    }
    const bottom = Math.max(...positions.map((item) => item.bottomEdge));
    return bottom;
  });

  readonly fieldBottom = computed(() => {
    const widgetsBottom = this.widgetsBottom();
    const extraRows = this.extraRows();
    if (!widgetsBottom) {
      return 0;
    }
    return widgetsBottom + extraRows;
  });

  readonly positions = computed(() => {
    const positions = this.positionsStateInternal();
    const notRenderedWidgets = this.notRenderedWidgetTypes();
    const isEditMode = this.editMode();
    if (isEditMode) {
      return positions;
    }
    return this._utils.realignPositionsWithHiddenWidgets(positions, notRenderedWidgets);
  });

  private readonly fieldState = computed(() => {
    const positions = Object.values(this.positionsStateInternal());
    const fieldBottom = this.fieldBottom();
    if (!positions.length || !fieldBottom) {
      return new Uint8Array(0);
    }
    const size = this._colCount * fieldBottom;

    const field = new Uint8Array(size);
    positions.forEach((item) => this._utils.fillPosition(field, item));
    return field;
  });

  getField(): Uint8Array {
    return untracked(() => this.fieldState());
  }

  getFieldBottom(): number {
    return untracked(() => this.fieldBottom());
  }

  getWidgetPositions(): Record<string, WidgetPosition> {
    return untracked(() => this.positionsStateInternal());
  }

  getPosition(elementId: string): WidgetPosition | undefined {
    return untracked(() => this.positionsStateInternal())[elementId];
  }

  getWidgetType(widgetId: string): string {
    return this._utils.getWidgetType(widgetId);
  }

  updatePosition(position: WidgetPosition): void {
    const fieldBottomBeforeUpdate = untracked(() => this.fieldBottom());
    const positionsState = untracked(() => this.positionsStateInternal());
    const newPositionsState = { ...positionsState, [position.id]: position };
    const fileBottomAfterUpdate = Math.max(...Object.values(newPositionsState).map((item) => item.bottomEdge));

    this.positionsStateInternal.set(newPositionsState);
    if (fileBottomAfterUpdate === fieldBottomBeforeUpdate) {
      this.extraRows.set(0);
    }
  }

  swapPositions(aElementId: string, bElementId: string): void {
    const positions = untracked(() => this.positionsStateInternal());
    const positionA = positions[aElementId];
    const positionB = positions[bElementId];
    if (!positionA || !positionB) {
      return;
    }
    const newPositionA = new WidgetPosition(aElementId, positionA.widgetType, positionB);
    const newPositionB = new WidgetPosition(bElementId, positionB.widgetType, positionA);
    this.positionsStateInternal.update((value) => ({
      ...value,
      [newPositionA.id]: newPositionA,
      [newPositionB.id]: newPositionB,
    }));
  }

  correctPositionForDrag(
    elementId: string,
    position: WidgetPosition,
    dragPoint: GridPoint,
  ): PositionToApply | undefined {
    return this._utils.correctPositionForDrag(elementId, position, dragPoint);
  }

  correctPositionForResize(elementId: string, position: WidgetPosition): WidgetPosition | undefined {
    return this._utils.correctPositionForResize(elementId, position);
  }

  setNotRenderedWidgets(widgetTypes: string[]): void {
    this.notRenderedWidgetTypes.set(widgetTypes);
  }

  removeRow(row: number): void {
    const positions = untracked(() => this.positionsStateInternal());
    let hasChanges = false;
    const updatedPositions = Object.values(positions).reduce(
      (res, position) => {
        if (position.row < row) {
          return res;
        }
        hasChanges = true;
        const updatedPosition = position.clone();
        updatedPosition.row--;
        res[updatedPosition.id] = updatedPosition;
        return res;
      },
      {} as Record<string, WidgetPosition>,
    );

    if (hasChanges) {
      this.positionsStateInternal.update((value) => ({ ...value, ...updatedPositions }));
      return;
    }

    this.extraRows.update((value) => value - 1);
  }

  insertAfterRow(row: number): void {
    const positions = untracked(() => this.positionsStateInternal());
    let hasChanges = false;
    const updatedPositions = Object.values(positions).reduce(
      (res, position) => {
        if (position.row <= row) {
          return res;
        }
        hasChanges = true;
        const updatedPosition = position.clone();
        updatedPosition.row++;
        res[updatedPosition.id] = updatedPosition;
        return res;
      },
      {} as Record<string, WidgetPosition>,
    );

    if (hasChanges) {
      this.positionsStateInternal.update((value) => ({ ...value, ...updatedPositions }));
      return;
    }

    this.extraRows.update((value) => value + 1);
  }

  initializePositions(positions: WidgetPosition[], typesToAllocate: string[]): void {
    const positionsMap = positions.reduce(
      (res, item) => {
        res[item.id] = item;
        return res;
      },
      {} as Record<string, WidgetPosition>,
    );
    this.positionsStateInternal.set(positionsMap);
    this.determineInitialPositions(typesToAllocate);
  }

  remove(id: string): void {
    if (!this.getPosition(id)) {
      return;
    }
    this.positionsStateInternal.update((value) => {
      const result = { ...value };
      delete result[id];
      return result;
    });
  }

  add(widgetType: string): void {
    const info = this._gridConfig.defaultElementParamsMap[widgetType];
    const positionParams = this._utils.findProperPositionAtEnd(info.widthInCells, info.heightInCells);
    const id = v4();
    const position = new WidgetPosition(id, info.widgetType, positionParams);
    this.updatePosition(position);
  }

  isEmptyRow(row: number): boolean {
    return this._utils.isRowEmpty(row);
  }

  private determineInitialPositions(typesToAllocate: string[]): void {
    for (const widgetType of typesToAllocate) {
      /*
      if (!!this.getPosition(widgetType)) {
        continue;
      }
*/
      const info = this._gridConfig.defaultElementParamsMap[widgetType];
      if (!info) {
        continue;
      }
      const positionParams = this._utils.findProperPositionAtEnd(info.widthInCells, info.heightInCells);
      const id = v4();
      const position = new WidgetPosition(id, info.widgetType, positionParams);
      this.updatePosition(position);
    }
  }
}
