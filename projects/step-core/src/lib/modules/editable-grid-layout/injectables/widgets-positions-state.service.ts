import { computed, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { WidgetPosition, WidgetPositionParams } from '../types/widget-position';
import { GRID_COLUMN_COUNT } from './grid-column-count.token';
import { GridEditableService } from './grid-editable.service';
import { GRID_LAYOUT_CONFIG } from './grid-layout-config.token';
import { PositionToApply } from '../types/position-to-apply';
import { VisibilityInfo, WidgetsVisibilityStateService } from './widgets-visibility-state.service';
import { WidgetsPositionsUtilsService } from './widgets-positions-utils.service';
import { WidgetPositionsUtilsContext } from '../types/widget-positions-utils-context';

@Injectable()
export class WidgetsPositionsStateService
  implements WidgetsVisibilityStateService, WidgetPositionsUtilsContext, GridEditableService
{
  private _gridConfig = inject(GRID_LAYOUT_CONFIG);
  private _colCount = inject(GRID_COLUMN_COUNT);
  private _utils = inject(WidgetsPositionsUtilsService).withContext(this);

  private readonly editModeInternal = signal(false);
  readonly editMode = this.editModeInternal.asReadonly();

  setEditMode(value: boolean): void {
    this.editModeInternal.set(value);
  }

  private readonly notRenderedWidgets = signal<string[]>([]);
  private readonly positionsStateInternal = signal<Record<string, WidgetPosition>>({});
  readonly positionsState = this.positionsStateInternal.asReadonly();

  readonly visibilityInfo = computed(() => {
    const positionsState = this.positionsState();
    return this._gridConfig.defaultElementParams.map((item) => {
      const { id, title } = item;
      const isVisible = !!positionsState[id];
      return { id, title, isVisible } as VisibilityInfo;
    });
  });

  private readonly extraRows = signal(0);

  private effectResetExtraRows = effect(() => {
    const isEditMode = this.editMode();
    if (!isEditMode) {
      this.extraRows.set(0);
    }
  });

  readonly fieldBottom = computed(() => {
    const positions = Object.values(this.positionsStateInternal());
    const extraRows = this.extraRows();
    if (!positions.length) {
      return 0;
    }
    const bottom = Math.max(...positions.map((item) => item.bottomEdge));
    return bottom + extraRows;
  });

  readonly positions = computed(() => {
    const positions = this.positionsStateInternal();
    const notRenderedWidgets = this.notRenderedWidgets();
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
    const newPositionA = new WidgetPosition(aElementId, positionB);
    const newPositionB = new WidgetPosition(bElementId, positionA);
    this.positionsStateInternal.update((value) => ({
      ...value,
      [newPositionA.id]: newPositionA,
      [newPositionB.id]: newPositionB,
    }));
  }

  correctPositionForDrag(elementId: string, position: WidgetPosition): PositionToApply | undefined {
    return this._utils.correctPositionForDrag(elementId, position);
  }

  correctPositionForResize(elementId: string, position: WidgetPosition): WidgetPosition | undefined {
    return this._utils.correctPositionForResize(elementId, position);
  }

  setNotRenderedWidgets(widgetsIds: string[]): void {
    this.notRenderedWidgets.set(widgetsIds);
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

  initializePositions(positions: WidgetPosition[], idsToAllocate: string[]): void {
    const positionsMap = positions.reduce(
      (res, item) => {
        res[item.id] = item;
        return res;
      },
      {} as Record<string, WidgetPosition>,
    );
    this.positionsStateInternal.set(positionsMap);
    this.determineInitialPositions(idsToAllocate);
  }

  isVisible(id: string): boolean {
    return !!this.getPosition(id);
  }

  hide(id: string): void {
    if (!this.isVisible(id)) {
      return;
    }
    this.positionsStateInternal.update((value) => {
      const result = { ...value };
      delete result[id];
      return result;
    });
  }

  show(id: string): void {
    if (this.isVisible(id)) {
      return;
    }
    const info = this._gridConfig.defaultElementParamsMap[id];
    const positionParams = this._utils.findProperPosition(info.widthInCells, info.heightInCells);
    const position = new WidgetPosition(info.id, positionParams);
    this.updatePosition(position);
  }

  private determineInitialPositions(widgetIds: string[]): void {
    for (const id of widgetIds) {
      if (!!this.getPosition(id)) {
        continue;
      }
      const info = this._gridConfig.defaultElementParamsMap[id];
      if (!info) {
        continue;
      }
      const positionParams = this._utils.findProperPositionAtEnd(info.widthInCells, info.heightInCells);
      const position = new WidgetPosition(info.id, positionParams);
      this.updatePosition(position);
    }
  }
}
