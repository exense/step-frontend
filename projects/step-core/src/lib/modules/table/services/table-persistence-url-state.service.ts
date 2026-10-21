import { TablePersistenceStateService } from './table-persistence-state.service';
import { DestroyRef, ErrorHandler, inject, Injectable } from '@angular/core';
import { SearchValue } from '../shared/search-value';
import {
  ActivatedRoute,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationSkipped,
  Params,
  Router,
} from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TABLE_PERSISTENCE_URL_PARAMS_SERIALIZERS } from './table-persistence-url-params-serializer.token';
import { FilterCondition } from '../shared/filter-condition';
import { QUERY_PARAMS_CLEANUP_NAVIGATION } from '../../routing/injectables/navigator-query-params-cleanup.service';

export const TABLE_QUERY_PREFIX = 'tq_';

@Injectable()
export class TablePersistenceUrlStateService extends TablePersistenceStateService {
  private _activatedRoute = inject(ActivatedRoute);
  private _router = inject(Router);
  private _destroyRef = inject(DestroyRef);
  private _errorHandler = inject(ErrorHandler);
  private _urlParamsSerializers = inject(TABLE_PERSISTENCE_URL_PARAMS_SERIALIZERS);

  private isSearchRestoreRequired = false;
  private readonly storagePath = this.currentRouterUrlPath;
  private previousQueryParams = this._activatedRoute.snapshot.queryParams;
  private pendingTableQueryParams?: Params;
  private isUrlUpdateScheduled = false;

  private get currentRouterUrlPath(): string {
    const url = this._router.parseUrl(this._router.url);
    url.queryParams = {};
    url.fragment = null;
    return this._router.serializeUrl(url);
  }

  override initialize(): void {
    super.initialize();

    this._router.events.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.handleNavigationEnd();
      }
      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError ||
        event instanceof NavigationSkipped
      ) {
        this.scheduleUrlUpdate();
      }
    });
  }

  private handleNavigationEnd(): void {
    if (!this.canStoreSearch) {
      return;
    }
    if (this.storagePath !== this.currentRouterUrlPath) {
      this.isSearchRestoreRequired = true;
      return;
    }

    const queryParams = this._activatedRoute.snapshot.queryParams;
    const previousQueryParams = this.previousQueryParams;
    this.previousQueryParams = queryParams;
    const navigationInfo = this._router.lastSuccessfulNavigation?.extras.info;
    const isSearchRestoreRequired = this.isSearchRestoreRequired;
    this.isSearchRestoreRequired = false;

    if (navigationInfo === this) {
      return;
    }
    if (
      navigationInfo === QUERY_PARAMS_CLEANUP_NAVIGATION ||
      (isSearchRestoreRequired && !this.hasUrlSearch(queryParams))
    ) {
      this.setUrlSearch(super.getSearch());
    } else if (isSearchRestoreRequired || this.hasUrlSearchChanged(previousQueryParams, queryParams)) {
      this.triggerExternalSearchChange(this.getUrlSearch(queryParams));
    }
  }

  override getSearch(): Record<string, SearchValue> {
    if (!this.canStoreSearch) {
      return {};
    }
    if (this.hasUrlSearch(this._activatedRoute.snapshot.queryParams)) {
      const urlSearch = this.getUrlSearch(this._activatedRoute.snapshot.queryParams);
      super.saveSearch(urlSearch);
      return urlSearch;
    }

    const storedSearch = super.getSearch();
    this.setUrlSearch(storedSearch);
    return storedSearch;
  }

  override saveSearch(search: Record<string, SearchValue>): void {
    if (!this.canStoreSearch) {
      return;
    }
    this.setUrlSearch(search);
    super.saveSearch(search);
  }

  private getUrlSearch(queryParams: Params): Record<string, SearchValue> {
    const result = Object.entries(queryParams).reduce(
      (res, [key, value]) => {
        const tableKey = this.getTableKey(key);
        if (!tableKey) {
          return res;
        }
        const tableValue = this.parseUrlValue(value);
        if (!tableValue) {
          return res;
        }
        res[tableKey] = tableValue;
        return res;
      },
      {} as Record<string, SearchValue>,
    );
    return result;
  }

  private setUrlSearch(search: Record<string, SearchValue>): void {
    const tableQueryParams = Object.entries(search).reduce((res, [key, searchValue]) => {
      const urlKey = this.getUrlKey(key);
      const urlValue = this.convertToUrlValue(searchValue);
      if (urlValue) {
        res[urlKey] = urlValue;
      }
      return res;
    }, {} as Params);

    this.pendingTableQueryParams = tableQueryParams;
    this.scheduleUrlUpdate();
  }

  private convertToUrlValue(searchValue: SearchValue): string {
    const serializer = this._urlParamsSerializers.find((item) => item.isValueMatchForSerialize(searchValue))!;

    return serializer.serialize(searchValue);
  }

  private parseUrlValue(value: string): SearchValue | undefined {
    const serializer = this._urlParamsSerializers.find((item) => item.isValueMatchForDeserialize(value))!;

    const searchValue = serializer.deserialize(value);
    if (!(searchValue instanceof FilterCondition)) {
      return searchValue;
    }

    return this._filterConditionFactory.create(searchValue);
  }

  private hasUrlSearch(queryParams: Params): boolean {
    const keys = Object.keys(queryParams);
    return keys.some((key) => this.isTableKey(key));
  }

  private hasUrlSearchChanged(previous: Params, current: Params): boolean {
    const keys = new Set([...Object.keys(previous), ...Object.keys(current)].filter((key) => this.isTableKey(key)));
    return [...keys].some((key) => previous[key] !== current[key]);
  }

  private getUrlKey(key: string): string {
    return `${TABLE_QUERY_PREFIX}${key}`;
  }

  private isTableKey(key: string): boolean {
    return key.startsWith(TABLE_QUERY_PREFIX);
  }

  private getTableKey(key: string): string | undefined {
    if (!this.isTableKey(key)) {
      return undefined;
    }
    return key.replace(TABLE_QUERY_PREFIX, '');
  }

  private scheduleUrlUpdate(): void {
    if (!this.pendingTableQueryParams || this.isUrlUpdateScheduled || this._destroyRef.destroyed) {
      return;
    }
    this.isUrlUpdateScheduled = true;
    void Promise.resolve().then(() => {
      this.isUrlUpdateScheduled = false;
      this.updateUrl();
    });
  }

  private updateUrl(): void {
    if (this._destroyRef.destroyed || !this.pendingTableQueryParams || this._router.getCurrentNavigation()) {
      return;
    }
    if (this.storagePath !== this.currentRouterUrlPath) {
      this.pendingTableQueryParams = undefined;
      return;
    }

    const queryParams = { ...this._activatedRoute.snapshot.queryParams };
    Object.keys(queryParams)
      .filter((key) => this.isTableKey(key))
      .forEach((key) => delete queryParams[key]);
    Object.assign(queryParams, this.pendingTableQueryParams);
    this.pendingTableQueryParams = undefined;
    const url = this._router.createUrlTree([], {
      relativeTo: this._activatedRoute,
      queryParams,
      preserveFragment: true,
    });
    if (this._router.serializeUrl(url) === this._router.url) {
      return;
    }
    void this._router
      .navigateByUrl(url, { replaceUrl: true, info: this })
      .catch((error: unknown) => this._errorHandler.handleError(error));
  }
}
