import { WidgetStatePreset } from '../types/widget-state-preset';
import { Observable } from 'rxjs';
import { KeyValue } from '@angular/common';
import { Injectable } from '@angular/core';

@Injectable()
export abstract class GridPersistenceStateService {
  abstract save(gridId: string, preset: WidgetStatePreset): Observable<string>;
  abstract load(gridId: string, presetId: string): Observable<WidgetStatePreset | undefined>;
  abstract getGridPresets(gridId: string): Observable<KeyValue<string, string>[]>;
  abstract getGridDefaultPresetSelection(gridId: string): Observable<string>;
  abstract removeGridPreset(gridId: string, presetId: string): Observable<void>;
  abstract shareGridPreset(gridId: string, presetId: string): Observable<void>;
  abstract unshareGridPreset(gridId: string, presetId: string): Observable<void>;
}
