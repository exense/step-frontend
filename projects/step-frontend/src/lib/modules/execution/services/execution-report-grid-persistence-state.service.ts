import { inject, Injectable } from '@angular/core';
import {
  LOCAL_STORAGE,
  AppConfigContainerService,
  EXECUTION_REPORT_LAYOUT_QUERY_PARAM,
  EXECUTION_REPORT_LAYOUT_ROUTE_DATA,
  ExecutionReportStaticLayout,
  ExecutionReportStaticLayoutRegistryService,
  GridPersistenceStateService,
  GridPresetListItem,
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
  private _staticLayouts = inject(ExecutionReportStaticLayoutRegistryService);

  save(gridId: string, preset: WidgetStatePreset): Observable<string> {
    const staticLayout = this.getStaticLayout();
    if (staticLayout) {
      return of(staticLayout.id);
    }
    return this._api.saveReportLayout(preset).pipe(
      logAndRethrow(),
      map((result) => result.id!),
    );
  }

  load(gridId: string, presetId: string): Observable<WidgetStatePreset | undefined> {
    const staticLayout = this.getStaticLayout();
    if (staticLayout) {
      return of(presetId === staticLayout.id ? this.toPreset(staticLayout) : undefined);
    }
    return this._api.getReportLayoutById(presetId).pipe(
      logAndRethrow(),
      map((result) => result as WidgetStatePreset),
    );
  }

  getGridPresets(gridId: string): Observable<GridPresetListItem[]> {
    const staticLayout = this.getStaticLayout();
    if (staticLayout) {
      return of([{ key: staticLayout.id, value: staticLayout.name, visibility: 'Preset' }]);
    }
    return this._api.getAllReportLayouts().pipe(
      logAndRethrow(),
      map((result) =>
        result.map((layout) => ({
          key: layout.id!,
          value: layout.attributes?.['name'] ?? '',
          visibility: layout.visibility,
          creationUser: layout.creationUser,
        })),
      ),
    );
  }

  getGridPreferredPresetSelection(gridId: string): Observable<string | undefined> {
    const staticLayout = this.getStaticLayout();
    if (staticLayout) {
      return of(staticLayout.id);
    }
    const queryParamPresetId = this._activatedRoute.snapshot.queryParams[LAYOUT_ID_QUERY_PARAM] as string | undefined;
    if (queryParamPresetId) {
      return of(queryParamPresetId);
    }
    return of(this._localStorage.getItem(this.getSelectedLayoutStorageKey(gridId)) ?? undefined);
  }

  getGridDefaultPresetSelection(gridId: string): Observable<string> {
    const staticLayout = this.getStaticLayout();
    if (staticLayout) {
      return of(staticLayout.id);
    }
    const id = this._appConfigContainer.conf?.miscParams?.[DEFAULT_LAYOUT_ID_KEY] ?? '';
    return of(id);
  }

  setGridSelectedPresetSelection(gridId: string, presetId: string): void {
    if (this.getStaticLayout()) {
      return;
    }
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
    if (this.getStaticLayout()) {
      return of(undefined);
    }
    return this._api.deleteReportLayout(presetId).pipe(
      logAndRethrow(),
      map(() => {}),
    );
  }

  shareGridPreset(gridId: string, presetId: string): Observable<void> {
    if (this.getStaticLayout()) {
      return of(undefined);
    }
    return this._api.shareReportLayout(presetId).pipe(
      logAndRethrow(),
      map(() => {}),
    );
  }

  unshareGridPreset(gridId: string, presetId: string): Observable<void> {
    if (this.getStaticLayout()) {
      return of(undefined);
    }
    return this._api.unshareReportLayout(presetId).pipe(
      logAndRethrow(),
      map(() => {}),
    );
  }

  private getSelectedLayoutStorageKey(gridId: string): string {
    return `${SELECTED_LAYOUT_ID_STORAGE_KEY}.${gridId}`;
  }

  private getStaticLayout(): ExecutionReportStaticLayout | undefined {
    const layoutId =
      (this._activatedRoute.snapshot.data[EXECUTION_REPORT_LAYOUT_ROUTE_DATA] as string | undefined) ??
      (this._activatedRoute.snapshot.queryParams[EXECUTION_REPORT_LAYOUT_QUERY_PARAM] as string | undefined);
    return this._staticLayouts.get(layoutId);
  }

  private toPreset(staticLayout: ExecutionReportStaticLayout): WidgetStatePreset {
    return {
      id: staticLayout.id,
      attributes: { name: staticLayout.name },
      visibility: 'Preset',
      layout: staticLayout.layout as NonNullable<WidgetStatePreset['layout']>,
    };
  }
}
