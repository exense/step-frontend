import { inject, Injectable } from '@angular/core';
import { catchError, filter, map, Observable, of, switchMap, timer } from 'rxjs';
import { GridSessionStorageService } from './grid-session-storage.service';
import { WidgetStatePreset } from '../types/widget-state-preset';
import { KeyValue } from '@angular/common';
import { v4 } from 'uuid';
import { AuthService } from '../../auth';
import { GridPersistenceStateService } from './grid-persistence-state.service';

@Injectable({
  providedIn: 'root',
})
export class GridPersistenceStateDefaultImplService implements GridPersistenceStateService {
  private _storage = inject(GridSessionStorageService);
  private _auth = inject(AuthService);

  save(gridId: string, preset: WidgetStatePreset): Observable<string> {
    if (!preset.id) {
      preset.id = v4();
    }
    if (!preset.visibility) {
      preset.visibility = 'Private';
    }
    if (!preset.creationUser && this._auth.isAuthenticated()) {
      preset.creationUser = this._auth.getUserID();
    }
    const presetJson = JSON.stringify(preset);
    const gridPresetKey = `${gridId}_preset_${preset.id}`;
    this._storage.setItem(gridPresetKey, presetJson);
    this.saveGridPreset(gridId, { key: preset.id, value: preset.attributes!['name'] });
    return timer(50).pipe(map(() => preset.id!));
  }

  load(gridId: string, presetId: string): Observable<WidgetStatePreset | undefined> {
    return timer(200).pipe(
      map(() => `${gridId}_preset_${presetId}`),
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
    return timer(200).pipe(
      map(() => gridId),
      map((gridId) => this.loadGridPresets(gridId)),
      map((presets) => Object.entries(presets).map(([key, value]) => ({ key, value }))),
      switchMap((presets) => {
        if (presets.length > 0) {
          return of(presets);
        }
        // default preset
        const defaultPreset = this.createDefaultPreset();
        return this.save(gridId, defaultPreset).pipe(
          map(() => [
            { key: defaultPreset.id!, value: defaultPreset.attributes!['name']! } as KeyValue<string, string>,
          ]),
        );
      }),
    );
  }

  getGridDefaultPresetSelection(gridId: string): Observable<string> {
    return of('default');
  }

  removeGridPreset(gridId: string, presetId: string): Observable<void> {
    const presets = this.loadGridPresets(gridId);
    delete presets[presetId];
    this.saveGridPresets(gridId, presets);
    const gridPresetKey = `${gridId}_preset_${presetId}`;
    this._storage.removeItem(gridPresetKey);
    return timer(50).pipe(map(() => {}));
  }

  shareGridPreset(gridId: string, presetId: string): Observable<void> {
    return this.load(gridId, presetId).pipe(
      filter((preset) => !!preset),
      switchMap((preset) => {
        preset.visibility = 'Shared';
        return this.save(gridId, preset);
      }),
      map(() => {}),
    );
  }

  unshareGridPreset(gridId: string, presetId: string): Observable<void> {
    return this.load(gridId, presetId).pipe(
      filter((preset) => !!preset),
      switchMap((preset) => {
        preset.visibility = 'Private';
        return this.save(gridId, preset);
      }),
      map(() => {}),
    );
  }

  private createDefaultPreset(): WidgetStatePreset {
    const preset: WidgetStatePreset = {
      id: 'default',
      attributes: {
        name: 'Default',
      },
      visibility: 'Preset',
      layout: undefined,
    };
    return preset;
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
