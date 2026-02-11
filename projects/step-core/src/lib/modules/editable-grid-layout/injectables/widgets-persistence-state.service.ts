import { inject, Injectable, signal, untracked } from '@angular/core';
import { GridPersistenceService } from './grid-persistence.service';
import { GRID_LAYOUT_CONFIG } from './grid-layout-config.token';
import { WidgetsPositionsStateService } from './widgets-positions-state.service';
import { map, Observable, tap } from 'rxjs';
import { WidgetPosition, WidgetPositionParams } from '../types/widget-position';
import { WidgetState } from '../types/widget-state';

@Injectable()
export class WidgetsPersistenceStateService {
  private _gridConfig = inject(GRID_LAYOUT_CONFIG);
  private _gridPersistence = inject(GridPersistenceService);
  private _widgetsPositions = inject(WidgetsPositionsStateService);

  private readonly ALL_WIDGET_IDS = Object.keys(this._gridConfig.defaultElementParamsMap);
  private lastSavedPositions: WidgetPosition[] = [];

  private readonly isInitializedInternal = signal(false);
  readonly isInitialized = this.isInitializedInternal.asReadonly();

  constructor() {
    this.initialize();
  }

  saveState(): Observable<void> {
    const positions = untracked(() => this._widgetsPositions.positionsState());
    const state = this._gridConfig.defaultElementParams.map((item) => {
      const id = item.id;
      const position = positions[id];
      const isVisible = !!position;
      return this.convertToWidgetState(id, position, isVisible);
    });
    return this._gridPersistence.save(this._gridConfig.gridId, state).pipe(
      tap(() => {
        this.lastSavedPositions = Object.values(positions);
      }),
    );
  }

  resetState(): void {
    this._widgetsPositions.initializePositions(this.lastSavedPositions, []);
  }

  private initialize(): void {
    const isInitialized = untracked(() => this.isInitialized());
    if (isInitialized) {
      return;
    }
    this._gridPersistence
      .load(this._gridConfig.gridId)
      .pipe(
        map((state) =>
          state.reduce(
            (res, item) => {
              res[item.id] = item;
              return res;
            },
            {} as Record<string, WidgetState>,
          ),
        ),
      )
      .subscribe((loadedState) => {
        const { positions, idsToAllocate } = this.ALL_WIDGET_IDS.reduce(
          (res, widgetId) => {
            // No loaded state for current widget
            if (loadedState[widgetId] === undefined) {
              // If visible by default auto allocate this widget
              if (this._gridConfig.defaultElementParamsMap[widgetId].defaultVisibility) {
                res.idsToAllocate.push(widgetId);
              }
            } else if (loadedState[widgetId].isVisible) {
              res.positions.push(new WidgetPosition(widgetId, loadedState[widgetId].position!));
            }

            return res;
          },
          {
            positions: [] as WidgetPosition[],
            idsToAllocate: [] as string[],
          },
        );

        this._widgetsPositions.initializePositions(positions, idsToAllocate);
        this.isInitializedInternal.set(true);
        queueMicrotask(() => {
          const positions = untracked(() => this._widgetsPositions.positionsState());
          this.lastSavedPositions = Object.values(positions);
        });
      });
  }

  private convertToWidgetState(
    id: string,
    position: WidgetPositionParams | undefined,
    isVisible: boolean,
  ): WidgetState {
    if (!position) {
      return {
        id,
        isVisible,
      };
    }
    const { row, column, widthInCells, heightInCells } = position;
    return {
      id,
      isVisible,
      position: {
        row,
        column,
        widthInCells,
        heightInCells,
      },
    };
  }
}
