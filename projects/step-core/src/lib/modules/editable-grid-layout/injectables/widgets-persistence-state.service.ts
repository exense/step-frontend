import { computed, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { GridPersistenceStateDefaultImplService } from './grid-persistence-state-default-impl.service';
import { GRID_LAYOUT_CONFIG } from './grid-layout-config.token';
import { WidgetsPositionsStateService } from './widgets-positions-state.service';
import { forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import { WidgetPosition, WidgetPositionParams } from '../types/widget-position';
import { WidgetState } from '../types/widget-state';
import { KeyValue } from '@angular/common';
import { WidgetStatePreset } from '../types/widget-state-preset';
import { v4 } from 'uuid';
import { GridPersistenceStateService } from './grid-persistence-state.service';

@Injectable()
export class WidgetsPersistenceStateService {
  private _gridConfig = inject(GRID_LAYOUT_CONFIG);
  private _gridPersistence =
    inject(GridPersistenceStateService, { optional: true }) ??
    inject<GridPersistenceStateService>(GridPersistenceStateDefaultImplService);
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

  saveState(name?: string): Observable<void> {
    const positions = untracked(() => this._widgetsPositions.positionsState());
    const preset = untracked(() => this.selectedPreset())!;
    const widgets = this.getWidgetsStates();
    const presetToSave: WidgetStatePreset = {
      ...preset,
      attributes: name ? { ...preset.attributes, name } : preset.attributes,
      layout: { widgets } as WidgetStatePreset['layout'],
    };
    return this._gridPersistence.save(this._gridConfig.gridId, presetToSave).pipe(
      tap(() => {
        this.lastSavedPositions.set(positions);
        this.selectedPresetInternal.update(
          (value) =>
            ({
              ...value!,
              attributes: name ? { ...value!.attributes, name } : value!.attributes,
              layout: { widgets },
            }) as WidgetStatePreset,
        );
        if (name) {
          this.gridPresetsInternal.update((presets) =>
            presets.map((p) => (p.key === presetToSave.id ? { ...p, value: name } : p)),
          );
        }
      }),
      map(() => {}),
    );
  }

  createPreset(name: string): Observable<string> {
    const widgets = this.getWidgetsStates();
    const preset: WidgetStatePreset = {
      attributes: {
        name,
      },
      layout: {
        widgets,
      } as WidgetStatePreset['layout'],
    };
    return this._gridPersistence.save(this._gridConfig.gridId, preset).pipe(
      switchMap((presetId) =>
        this._gridPersistence.getGridPresets(this._gridConfig.gridId).pipe(
          tap((presets) => this.gridPresetsInternal.set(presets)),
          tap(() => this.selectPreset(presetId)),
          map(() => presetId),
        ),
      ),
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

  sharePreset(id: string): Observable<void> {
    return this._gridPersistence.shareGridPreset(this._gridConfig.gridId, id).pipe(
      tap(() => {
        const preset = untracked(() => this.selectedPresetInternal());
        if (preset?.id === id) {
          this.selectedPresetInternal.update(
            (value) =>
              ({
                ...value,
                visibility: 'Shared',
              }) as WidgetStatePreset,
          );
        }
      }),
    );
  }

  unsharePreset(id: string): Observable<void> {
    return this._gridPersistence.unshareGridPreset(this._gridConfig.gridId, id).pipe(
      tap(() => {
        const preset = untracked(() => this.selectedPresetInternal());
        if (preset?.id === id) {
          this.selectedPresetInternal.update(
            (value) =>
              ({
                ...value,
                visibility: 'Private',
              }) as WidgetStatePreset,
          );
        }
      }),
    );
  }

  resetState(): void {
    const lastSavedPositions = untracked(() => this.lastSavedPositions());
    const positions = Object.values(lastSavedPositions ?? {});
    this._widgetsPositions.initializePositions(positions, []);
    queueMicrotask(() => {
      const positions = untracked(() => this._widgetsPositions.positionsState());
      this.lastSavedPositions.set(positions);
    });
  }

  selectPreset(presetId: string): void {
    this._gridPersistence
      .load(this._gridConfig.gridId, presetId)
      .subscribe((preset) => {
        if (!preset) {
          this.selectFallbackPreset(presetId);
          return;
        }
        this.selectedPresetInternal.set(preset);
        this._gridPersistence.setGridSelectedPresetSelection(this._gridConfig.gridId, preset.id!);
      });
  }

  private initialize(): void {
    const isInitialized = untracked(() => this.isInitialized());
    if (isInitialized) {
      return;
    }
    const presets$ = this._gridPersistence
      .getGridPresets(this._gridConfig.gridId)
      .pipe(tap((presets) => this.gridPresetsInternal.set(presets)));

    const preferredPreset$ = this._gridPersistence.getGridPreferredPresetSelection(this._gridConfig.gridId);

    const defaultPreset$ = this._gridPersistence
      .getGridDefaultPresetSelection(this._gridConfig.gridId)
      .pipe(map((presetId) => presetId ?? ''));

    forkJoin([presets$, preferredPreset$, defaultPreset$]).subscribe(([presets, preferredPreset, defaultPreset]) => {
      const presetKes = new Set(presets.map((item) => item.key));
      if (preferredPreset && presetKes.has(preferredPreset)) {
        this.selectPreset(preferredPreset);
        this.isInitializedInternal.set(true);
        return;
      }
      if (!presetKes.has(defaultPreset)) {
        defaultPreset = presets[0].key;
      }
      this.selectPreset(defaultPreset);
      this.isInitializedInternal.set(true);
    });
  }

  private selectFallbackPreset(invalidPresetId: string): void {
    forkJoin([
      this._gridPersistence.getGridPresets(this._gridConfig.gridId),
      this._gridPersistence.getGridDefaultPresetSelection(this._gridConfig.gridId),
    ])
      .pipe(
        map(([presets, defaultPreset]) => {
          const presetKeys = new Set(presets.map((item) => item.key));
          if (defaultPreset && presetKeys.has(defaultPreset) && defaultPreset !== invalidPresetId) {
            return defaultPreset;
          }
          return presets.find((item) => item.key !== invalidPresetId)?.key;
        }),
        switchMap((fallbackPresetId) => {
          if (!fallbackPresetId) {
            return of(undefined);
          }
          return this._gridPersistence.load(this._gridConfig.gridId, fallbackPresetId).pipe(
            tap((preset) => {
              if (!preset) {
                return;
              }
              this.selectedPresetInternal.set(preset);
              this._gridPersistence.setGridSelectedPresetSelection(this._gridConfig.gridId, preset.id!);
            }),
          );
        }),
      )
      .subscribe();
  }

  private initializePositions(preset?: WidgetStatePreset): void {
    let typesToAllocate: string[] = [];
    let usedWidgetTypes = new Set<string>();
    if (preset?.id === 'default') {
      usedWidgetTypes = new Set((preset?.layout?.widgets ?? []).map((state) => state.widgetType));
      typesToAllocate = this.ALL_WIDGET_TYPE_IDS.filter(
        (widgetType) =>
          this._gridConfig.defaultElementParamsMap[widgetType].defaultVisibility && !usedWidgetTypes.has(widgetType),
      );
    }

    const positions = (preset?.layout?.widgets ?? []).map(
      (widgetState) => new WidgetPosition(v4(), widgetState.widgetType, widgetState.position!),
    );

    this._widgetsPositions.initializePositions(positions, typesToAllocate);
  }

  private getWidgetsStates(): WidgetState[] {
    const positions = untracked(() => this._widgetsPositions.positionsState());
    const result = Object.values(positions).map((position) => {
      return this.convertToWidgetState(position.widgetType, position);
    });
    return result;
  }

  private convertToWidgetState(widgetType: string, position: WidgetPositionParams): WidgetState {
    const { row, column, widthInCells, heightInCells } = position;
    return {
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
