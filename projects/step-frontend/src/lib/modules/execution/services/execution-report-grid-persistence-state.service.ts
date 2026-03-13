import { KeyValue } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import {
  AppConfigContainerService,
  GridPersistenceStateService,
  ReportLayoutService,
  WidgetStatePreset,
} from '@exense/step-core';
import { catchError, map, Observable, of, pipe, UnaryFunction } from 'rxjs';

const DEFAULT_LAYOUT_ID_KEY = 'plugins.reporting.layouts.default.id';

const logAndRethrow = <T>(): UnaryFunction<Observable<T>, Observable<T>> =>
  pipe<Observable<T>, Observable<T>>(
    catchError((err) => {
      console.log('ReportLayoutService response error:');
      console.log(err);
      throw err;
    }),
  );

@Injectable()
export class ExecutionReportGridPersistenceStateService implements GridPersistenceStateService {
  private _api = inject(ReportLayoutService);
  private _appConfigContainer = inject(AppConfigContainerService);

  save(gridId: string, preset: WidgetStatePreset): Observable<string> {
    return this._api.saveReportLayout(preset).pipe(
      logAndRethrow(),
      map((result) => result.id!),
    );
  }

  load(gridId: string, presetId: string): Observable<WidgetStatePreset | undefined> {
    return this._api.getReportLayoutById(presetId).pipe(
      logAndRethrow(),
      map((result) => result as WidgetStatePreset),
    );
  }

  getGridPresets(gridId: string): Observable<KeyValue<string, string>[]> {
    return this._api.getAllReportLayouts().pipe(
      logAndRethrow(),
      map((result) =>
        result.map((layout) => {
          const key = layout.id;
          const value = layout.attributes?.['name'] ?? '';
          return { key, value } as KeyValue<string, string>;
        }),
      ),
    );
  }

  getGridDefaultPresetSelection(gridId: string): Observable<string> {
    const id = this._appConfigContainer.conf?.miscParams?.[DEFAULT_LAYOUT_ID_KEY] ?? '';
    return of(id);
  }

  removeGridPreset(gridId: string, presetId: string): Observable<void> {
    return this._api.deleteReportLayout(presetId).pipe(
      logAndRethrow(),
      map(() => {}),
    );
  }

  shareGridPreset(gridId: string, presetId: string): Observable<void> {
    return this._api.shareReportLayout(presetId).pipe(
      logAndRethrow(),
      map(() => {}),
    );
  }

  unshareGridPreset(gridId: string, presetId: string): Observable<void> {
    return this._api.unshareReportLayout(presetId).pipe(
      logAndRethrow(),
      map(() => {}),
    );
  }
}
