import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, timer } from 'rxjs';
import { GridSessionStorageService } from './grid-session-storage.service';
import {WidgetStatePreset} from '../types/widget-state-preset';
import {KeyValue} from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class GridPersistenceService {
  private _storage = inject(GridSessionStorageService);

  save(gridId: string, preset: WidgetStatePreset): Observable<void> {
    const presetToSave = {
      ...preset,
      widgets: preset.widgets.map((state) => (state.isVisible ? state : { id: state.id, isVisible: false }))
    } as WidgetStatePreset;
    const presetJson = JSON.stringify(presetToSave);
    const gridPresetKey = `${gridId}_preset_${preset.id}`;
    this._storage.setItem(gridPresetKey, presetJson);
    this.saveGridPreset(gridId, {key: preset.id, value: preset.name});
    return timer(100).pipe(map(() => {}));
  }

  load(gridId: string, presetKey: string): Observable<WidgetStatePreset | undefined> {
    return timer(250).pipe(
      map(() => `${gridId}_preset_${presetKey}`),
      map((gridPresetKey) => this._storage.getItem(gridPresetKey)),
      map((paramsJson) => {
        if (!paramsJson) {
          return undefined;
        }
        return this.parseJSON<WidgetStatePreset>(paramsJson);
      }),
      catchError((err) => {
        return of(undefined);
      }),
    );
  }

  getGridPresets(gridId: string): Observable<KeyValue<string, string>[]> {
    return timer(250)
      .pipe(
        map(() => gridId),
        map((gridId) => this.loadGridPresets(gridId)),
        map((presets) => Object.entries(presets).map(([key, value]) => ({key, value}))),
      )
  }

  getGridSelectedPreset(gridId: string): Observable<string | undefined> {
    return timer(250).pipe(
      map(() => gridId),
      map((gridId) => this._storage.getItem(`${gridId}_selectedPreset`) ?? undefined)
    )
  }

  setGridSelectedPreset(gridId: string, presetId: string): Observable<void> {
    this._storage.setItem(`${gridId}_selectedPreset`, presetId);
    return timer(100).pipe(map(() => {}));
  }

  removeGridPreset(gridId: string, presetKey: string): Observable<void> {
    const presets = this.loadGridPresets(gridId);
    delete presets[presetKey];
    this.saveGridPresets(gridId, presets);
    return timer(100).pipe(map(() => {}));
  }

  private saveGridPreset(gridId: string, preset: KeyValue<string, string>): void {
    const presets = this.loadGridPresets(gridId);
    presets[preset.key] = preset.value;
    this.saveGridPresets(gridId, presets);
  }

  private loadGridPresets(gridId: string): Record<string, string> {
    const gridPresetsJson = this._storage.getItem(`${gridId}_presets`);
    return this.parseJSON(gridPresetsJson) ?? {};
  }

  private saveGridPresets(gridId: string, presets: Record<string, string>): void {
    const gridPresetsJson = JSON.stringify(presets);
    this._storage.setItem(`${gridId}_presets`, gridPresetsJson);
  }

  private parseJSON<T>(json: string | null | undefined): T | undefined {
    let result: T | undefined = undefined;
    if (!json) {
      return result;
    }
    try {
      result = JSON.parse(json) as T;
    } catch (e) {
        result = undefined;
    }
    return result;
  }
}
