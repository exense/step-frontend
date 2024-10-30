import { TablePersistenceStateService } from './table-persistence-state.service';
import { inject, Injectable } from '@angular/core';
import { SearchValue } from '../shared/search-value';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';
import { filter, first, map, pairwise, switchMap, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TABLE_PERSISTENCE_URL_PARAMS_SERIALIZERS } from './table-persistence-url-params-serializer.token';

export const TABLE_QUERY_PREFIX = 'tq_';

@Injectable()
export class TablePersistenceUrlStateService extends TablePersistenceStateService {
  private _activatedRoute = inject(ActivatedRoute);
  private _router = inject(Router);
  private _urlParamsSerializers = inject(TABLE_PERSISTENCE_URL_PARAMS_SERIALIZERS);

  private isInternalUrlChange = false;
  private isSearchRestoreRequired = false;

  private navigationEnd$ = this._router.events.pipe(map((event) => event instanceof NavigationEnd));

  private storagePath = this.currentRouterUrlPath;

  private get currentRouterUrlPath() {
    const url = this._router.url;
    return !url.includes('?') ? url : url.slice(0, url.indexOf('?'));
  }

  private resetInternalUrlChangeFlag = this.navigationEnd$
    .pipe(
      switchMap(() => timer(100)),
      takeUntilDestroyed(),
    )
    .subscribe(() => (this.isInternalUrlChange = false));

  private restoreUrlSearch = this.navigationEnd$
    .pipe(
      switchMap(() => timer(100)),
      filter(() => this.isSearchRestoreRequired && this.storagePath === this._router.url),
      takeUntilDestroyed(),
    )
    .subscribe(() => {
      this.isSearchRestoreRequired = false;
      if (this.hasSearch()) {
        const search = super.getSearch();
        this.setUrlSearch(search);
      }
    });

  private byUrlChange = this._activatedRoute.queryParams
    .pipe(
      filter(() => this.canStoreSearch),
      filter(() => !this.isInternalUrlChange),
      filter((params) => this.hasUrlSearch(params)),
      map((params) => this.getUrlSearch(params)),
      takeUntilDestroyed(),
    )
    .subscribe((urlSearch) => this.triggerExternalSearchChange(urlSearch));

  private byUrlChangeCleanup = this._activatedRoute.queryParams
    .pipe(
      filter(() => this.canStoreSearch),
      pairwise(),
      filter(([prevParams, currentParams]) => this.hasUrlSearch(prevParams) && !this.hasUrlSearch(currentParams)),
      filter(() => !this.isInternalUrlChange),
      takeUntilDestroyed(),
    )
    .subscribe(() => this.triggerExternalSearchChange({}));

  protected override triggerExternalSearchChange(search: Record<string, SearchValue>): void {
    if (this.storagePath !== this.currentRouterUrlPath) {
      // It means that during the external change, the route has been changed
      // and new query parameters relates to another view. Indicate to restore the query parameters
      // from the storage, when the route will be navigated back to the path, where component
      // with current persistence url instance exists
      this.isSearchRestoreRequired = true;
      return;
    }
    super.triggerExternalSearchChange(search);
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

    const oldQueryParams = { ...this._activatedRoute.snapshot.queryParams };
    const tableKeys = Object.keys(oldQueryParams).filter((key) => this.isTableKey(key));
    tableKeys.forEach((key) => delete oldQueryParams[key]);

    const queryParams = { ...oldQueryParams, ...tableQueryParams };
    this.changeQueryParams(queryParams);
  }

  private convertToUrlValue(searchValue: SearchValue): string {
    const serializer = this._urlParamsSerializers.find((item) => item.isValueMatchForSerialize(searchValue))!;

    return serializer.serialize(searchValue);
  }

  private parseUrlValue(value: string): SearchValue | undefined {
    const serializer = this._urlParamsSerializers.find((item) => item.isValueMatchForDeserialize(value))!;

    return serializer.deserialize(value);
  }

  private hasUrlSearch(queryParams: Params): boolean {
    const keys = Object.keys(queryParams);
    return keys.some((key) => this.isTableKey(key));
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

  private changeQueryParams(queryParams: Params): void {
    if (this._router.getCurrentNavigation()) {
      this.navigationEnd$.pipe(first()).subscribe(() => this.changeQueryParams(queryParams));
      return;
    }
    this.isInternalUrlChange = true;
    this._router.navigate([], { relativeTo: this._activatedRoute, queryParams });
  }
}
