import { KeyValue } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import {
  LOCAL_STORAGE,
  AppConfigContainerService,
  GridPersistenceStateService,
  ReportLayoutService,
  WidgetStatePreset,
} from '@exense/step-core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, Observable, of, pipe, UnaryFunction } from 'rxjs';

const DEFAULT_LAYOUT_ID_KEY = 'plugins.reporting.layouts.default.id';
const SELECTED_LAYOUT_ID_STORAGE_KEY = 'executionReport.selectedLayoutId';
const LAYOUT_ID_QUERY_PARAM = 'layoutId';

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
  private _localStorage = inject(LOCAL_STORAGE);
  private _router = inject(Router);
  private _activatedRoute = inject(ActivatedRoute);

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

  getGridPreferredPresetSelection(gridId: string): Observable<string | undefined> {
    const queryParamPresetId = this._activatedRoute.snapshot.queryParams[LAYOUT_ID_QUERY_PARAM] as string | undefined;
    if (queryParamPresetId) {
      return of(queryParamPresetId);
    }
    return of(this._localStorage.getItem(this.getSelectedLayoutStorageKey(gridId)) ?? undefined);
  }

  getGridDefaultPresetSelection(gridId: string): Observable<string> {
    const id = this._appConfigContainer.conf?.miscParams?.[DEFAULT_LAYOUT_ID_KEY] ?? '';
    return of(id);
  }

  setGridSelectedPresetSelection(gridId: string, presetId: string): void {
    this._localStorage.setItem(this.getSelectedLayoutStorageKey(gridId), presetId);
    if (this._activatedRoute.snapshot.queryParams[LAYOUT_ID_QUERY_PARAM] === presetId) {
      return;
    }
    this._router.navigate([], {
      relativeTo: this._activatedRoute,
      queryParams: { [LAYOUT_ID_QUERY_PARAM]: presetId },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
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

  private getSelectedLayoutStorageKey(gridId: string): string {
    return `${SELECTED_LAYOUT_ID_STORAGE_KEY}.${gridId}`;
  }
}
