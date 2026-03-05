import { computed, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { GridPersistenceService } from './grid-persistence.service';
import { GRID_LAYOUT_CONFIG } from './grid-layout-config.token';
import { WidgetsPositionsStateService } from './widgets-positions-state.service';
import { forkJoin, from, map, Observable, of, switchMap, tap } from 'rxjs';
import { WidgetPosition, WidgetPositionParams } from '../types/widget-position';
import { WidgetState } from '../types/widget-state';
import { KeyValue } from '@angular/common';
import { WidgetStatePreset } from '../types/widget-state-preset';
import { v4 } from 'uuid';

@Injectable()
export class WidgetsPersistenceStateService {
  private _gridConfig = inject(GRID_LAYOUT_CONFIG);
  private _gridPersistence = inject(GridPersistenceService);
  private _widgetsPositions = inject(WidgetsPositionsStateService);

  private readonly ALL_WIDGET_TYPE_IDS = Object.keys(this._gridConfig.defaultElementParamsMap);
  private readonly lastSavedPositions = signal<Record<string, WidgetPosition> | undefined>(undefined);

  private readonly isInitializedInternal = signal(false);
  readonly isInitialized = this.isInitializedInternal.asReadonly();

  private readonly gridPresetsInternal = signal<KeyValue<string, string>[]>([]);
  readonly gridPresets = this.gridPresetsInternal.asReadonly();

  private readonly selectedPresetInternal = signal<WidgetStatePreset | undefined>(undefined);
  readonly selectedPreset = this.selectedPresetInternal.asReadonly();

  readonly hasChanges = computed(() => {
    const positions = this._widgetsPositions.positionsState();
    const lastSavedPositions = this.lastSavedPositions();
    return positions !== lastSavedPositions;
  });

  private effectPresetSelection = effect(() => {
    const selectedPreset = this.selectedPreset();
    if (!selectedPreset) {
      return;
    }
    this.initializePositions(selectedPreset);
    queueMicrotask(() => {
      const positions = untracked(() => this._widgetsPositions.positionsState());
      this.lastSavedPositions.set(positions);
    });
  });

  constructor() {
    this.initialize();
  }

  saveState(): Observable<void> {
    const positions = untracked(() => this._widgetsPositions.positionsState());
    const preset = untracked(() => this.selectedPreset())!;
    preset.widgets = this.getWidgetsStates();
    return this._gridPersistence.save(this._gridConfig.gridId, preset).pipe(
      tap(() => {
        this.lastSavedPositions.set(positions);
      }),
    );
  }

  createPreset(name: string): Observable<void> {
    const id = v4();
    const widgets = this.getWidgetsStates();
    const preset: WidgetStatePreset = { id, name, widgets };
    return this._gridPersistence.save(this._gridConfig.gridId, preset).pipe(
      switchMap(() => this._gridPersistence.getGridPresets(this._gridConfig.gridId)),
      tap((presets) => this.gridPresetsInternal.set(presets)),
      tap(() => this.selectPreset(id)),
      map(() => {}),
    );
  }

  removePreset(id: string): Observable<void> {
    return this._gridPersistence.removeGridPreset(this._gridConfig.gridId, id).pipe(
      switchMap(() => this._gridPersistence.getGridPresets(this._gridConfig.gridId)),
      tap((presets) => this.gridPresetsInternal.set(presets)),
      tap((presets) => this.selectPreset(presets[0].key)),
      map(() => {}),
    );
  }

  resetState(): void {
    const lastSavedPositions = untracked(() => this.lastSavedPositions());
    const positions = Object.values(lastSavedPositions ?? {});
    this._widgetsPositions.initializePositions(positions, []);
  }

  selectPreset(presetKey: string): void {
    this._gridPersistence
      .setGridSelectedPreset(this._gridConfig.gridId, presetKey)
      .pipe(switchMap(() => this._gridPersistence.load(this._gridConfig.gridId, presetKey)))
      .subscribe((preset) => this.selectedPresetInternal.set(preset));
  }

  private initialize(): void {
    const isInitialized = untracked(() => this.isInitialized());
    if (isInitialized) {
      return;
    }
    const presets$ = this._gridPersistence.getGridPresets(this._gridConfig.gridId).pipe(
      switchMap((presets) => {
        if (!!presets.length) {
          return of(presets);
        }
        return this.createDefaultPreset().pipe(map((defaultPreset) => [defaultPreset]));
      }),
      tap((presets) => this.gridPresetsInternal.set(presets)),
    );

    const selectedPreset$ = this._gridPersistence
      .getGridSelectedPreset(this._gridConfig.gridId)
      .pipe(map((presetId) => presetId ?? ''));

    forkJoin([presets$, selectedPreset$]).subscribe(([presets, selectedPreset]) => {
      const presetKes = new Set(presets.map((item) => item.key));
      if (!presetKes.has(selectedPreset)) {
        selectedPreset = presets[0].key;
      }
      this.selectPreset(selectedPreset);
      this.isInitializedInternal.set(true);
    });
  }

  private createDefaultPreset(): Observable<KeyValue<string, string>> {
    this.initializePositions();
    return from(Promise.resolve().then(() => this.getWidgetsStates())).pipe(
      map((widgets) => {
        const preset: WidgetStatePreset = {
          id: 'default',
          name: 'Default',
          protected: true,
          widgets,
        };
        return preset;
      }),
      switchMap((preset) =>
        this._gridPersistence
          .save(this._gridConfig.gridId, preset)
          .pipe(map(() => ({ key: preset.id, value: preset.name }))),
      ),
    );
  }

  private initializePositions(preset?: WidgetStatePreset): void {
    let typesToAllocate: string[] = [];
    let usedWidgetTypes = new Set<string>();
    if (preset?.id === 'default') {
      usedWidgetTypes = new Set((preset?.widgets ?? []).map((state) => state.widgetType));
      typesToAllocate = this.ALL_WIDGET_TYPE_IDS.filter(
        (widgetType) =>
          this._gridConfig.defaultElementParamsMap[widgetType].defaultVisibility && !usedWidgetTypes.has(widgetType),
      );
    }

    const positions = (preset?.widgets ?? []).map(
      (widgetState) => new WidgetPosition(widgetState.id, widgetState.widgetType, widgetState.position!),
    );

    this._widgetsPositions.initializePositions(positions, typesToAllocate);
  }

  private getWidgetsStates(): WidgetState[] {
    const positions = untracked(() => this._widgetsPositions.positionsState());
    const result = Object.entries(positions).map(([id, position]) => {
      return this.convertToWidgetState(id, position.widgetType, position);
    });
    return result;
  }

  private convertToWidgetState(id: string, widgetType: string, position: WidgetPositionParams): WidgetState {
    const { row, column, widthInCells, heightInCells } = position;
    return {
      id,
      widgetType,
      position: {
        row,
        column,
        widthInCells,
        heightInCells,
      },
    };
  }
}
