import { WidgetStatePreset } from '../types/widget-state-preset';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { GridPresetListItem } from '../types/grid-preset-list-item';

@Injectable()
export abstract class GridPersistenceStateService {
  abstract save(gridId: string, preset: WidgetStatePreset): Observable<string>;
  abstract load(gridId: string, presetId: string): Observable<WidgetStatePreset | undefined>;
  abstract getGridPresets(gridId: string): Observable<GridPresetListItem[]>;
  abstract getGridPreferredPresetSelection(gridId: string): Observable<string | undefined>;
  abstract getGridDefaultPresetSelection(gridId: string): Observable<string>;
  abstract setGridSelectedPresetSelection(gridId: string, presetId: string): void;
  abstract removeGridPreset(gridId: string, presetId: string): Observable<void>;
  abstract shareGridPreset(gridId: string, presetId: string): Observable<void>;
  abstract unshareGridPreset(gridId: string, presetId: string): Observable<void>;
}
